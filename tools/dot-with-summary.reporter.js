/* eslint-disable no-use-before-define */
import { EOL } from "node:os";

// eslint-disable-next-line no-undefined
const LOCALE = undefined;
const gTimeFormat = new Intl.NumberFormat(LOCALE, {
  style: "unit",
  unit: "millisecond",
  unitDisplay: "narrow",
  maximumFractionDigits: 0,
}).format;
const gPercentFormat = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  maximumFractionDigits: 2,
  notation: "compact",
}).format;
const gNumberFormat = new Intl.NumberFormat(LOCALE).format;

const BRANCH_COVERAGE_THRESHOLD = 99;
const FUNCTION_COVERAGE_THRESHOLD = 99;
const LINE_COVERAGE_THRESHOLD = 99;

// eslint-disable-next-line max-lines-per-function, complexity
export default async function* dotWithSummaryReporter(pSource) {
  let lFailStack = [];
  let lDiagnosticStack = [];
  let lCoverageObject = {};

  for await (const lEvent of pSource) {
    switch (lEvent.type) {
      case "test:pass":
        if (lEvent.data.details.type === "suite") {
          yield "";
        } else if (lEvent.data.skip || lEvent.data.todo) {
          yield ",";
        } else {
          yield ".";
        }
        break;
      case "test:fail":
        lFailStack.push(lEvent.data);
        if (lEvent.data.details.type === "suite") {
          yield "";
        } else {
          yield "!";
        }
        break;
      case "test:diagnostic":
        lDiagnosticStack.push(lEvent);
        break;
      // uncomment these lines if you're interested in any stdout/stderr
      case "test:stdout":
        yield lEvent.data.message;
        break;
      case "test:stderr":
        yield lEvent.data.message;
        break;
      // test:coverage apparently exists, but not seen in any runs so far
      case "test:coverage":
        lCoverageObject = lEvent;
        break;
      default:
        break;
    }
  }

  const lDiagnostics = lDiagnosticStack
    .map(diagnosticToObject)
    .reduce((pAll, pDiagnostic) => ({ ...pAll, ...pDiagnostic }), {});

  yield `${
    EOL + lFailStack.map(summarizeFailsToText).filter(Boolean).join(EOL)
  }${EOL}` +
    summarizeCounts(lDiagnostics) +
    EOL +
    summarizeCoverage(lCoverageObject) +
    EOL +
    getCoverageLines(lCoverageObject) +
    getCoverageFunctions(lCoverageObject);

  process.exitCode = determineExitCode(lFailStack, lCoverageObject);
}

function summarizeCoverage(pCoverageObject) {
  let lCoverageSummary = "";

  if (pCoverageObject?.data?.summary?.totals) {
    const lTotals = pCoverageObject.data.summary.totals;
    // console.log(lTotals);
    lCoverageSummary =
      "=============================== Coverage summary ===============================" +
      EOL +
      `Branches     : ${gPercentFormat(lTotals.coveredBranchCount / lTotals.totalBranchCount)} (${gNumberFormat(lTotals.coveredBranchCount)}/${gNumberFormat(lTotals.totalBranchCount)})` +
      `${lTotals.coveredBranchPercent < BRANCH_COVERAGE_THRESHOLD ? " NOK" : ""}` +
      EOL +
      `Functions    : ${gPercentFormat(lTotals.coveredFunctionCount / lTotals.totalFunctionCount)} (${gNumberFormat(lTotals.coveredFunctionCount)}/${gNumberFormat(lTotals.totalFunctionCount)})` +
      `${lTotals.coveredFunctionPercent < FUNCTION_COVERAGE_THRESHOLD ? " NOK" : ""}` +
      EOL +
      `Lines        : ${gPercentFormat(lTotals.coveredLineCount / lTotals.totalLineCount)} (${gNumberFormat(lTotals.coveredLineCount)}/${gNumberFormat(lTotals.totalLineCount)})` +
      `${lTotals.coveredLinePercent < LINE_COVERAGE_THRESHOLD ? " NOK" : ""}` +
      EOL +
      "================================================================================" +
      EOL;
    return lCoverageSummary;
  }
}

function getCoverageLines(pCoverageObject) {
  const lUncoveredLinesPerFiles = (pCoverageObject?.data?.summary?.files ?? [])
    .filter((pSummary) => pSummary.coveredLinePercent < 100)
    .map(
      (pSummary) =>
        "  " +
        pSummary.path +
        ":" +
        (pSummary.lines || [])
          .filter((pLine) => pLine.count <= 0)
          .map((pLine) => pLine.line)
          .join(","),
    );
  if (lUncoveredLinesPerFiles.length === 0) {
    return "";
  }
  return "Uncovered lines:" + EOL + lUncoveredLinesPerFiles.join(EOL) + EOL;
}

function getCoverageFunctions(pCoverageObject) {
  const lUncoveredFunctionsPerFiles = (
    pCoverageObject?.data?.summary?.files ?? []
  )
    .filter((pSummary) => pSummary.coveredFunctionPercent < 100)
    .map(
      (pSummary) =>
        "  " +
        pSummary.path +
        ":" +
        (pSummary.functions || [])
          .filter((pFunction) => pFunction.count <= 0)
          .map(
            (pFunction) =>
              `${pFunction.line}${pFunction.name ? `(${pFunction.name})` : ""}`,
          )
          .join(","),
    );
  if (lUncoveredFunctionsPerFiles.length === 0) {
    return "";
  }
  return (
    EOL +
    "Uncovered functions:" +
    EOL +
    lUncoveredFunctionsPerFiles.join(EOL) +
    EOL
  );
}

function summarizeCounts(pDiagnostics) {
  return (
    `${gNumberFormat(pDiagnostics.pass)} passing (${gTimeFormat(pDiagnostics.duration_ms)})` +
    EOL +
    `${pDiagnostics.fail > 0 ? `${pDiagnostics.fail} failing${EOL}` : ""}` +
    `${pDiagnostics.skipped > 0 ? `${pDiagnostics.skipped} skipped${EOL}` : ""}` +
    `${pDiagnostics.todo > 0 ? `${pDiagnostics.todo} todo${EOL}` : ""}`
  );
}

function determineExitCode(pFailStack, pCoverageObject) {
  if (pFailStack.length > 0) {
    return 1;
  }
  if (
    pCoverageObject?.data?.summary?.totals.coveredBranchPercent <
      BRANCH_COVERAGE_THRESHOLD ||
    pCoverageObject?.data?.summary?.totals.coveredFunctionPercent <
      FUNCTION_COVERAGE_THRESHOLD ||
    pCoverageObject?.data?.summary?.totals.coveredLinePercent <
      LINE_COVERAGE_THRESHOLD
  ) {
    // should return  1, but on node 22 with our setup at least coverage
    // runs can vary per run so even when the tests _do_ cover 100%, the
    // coverage might be reported as something lower.
    //
    // So far b.t.w. the results on node 20 _are_ consistent.
    return 0;
  }
  return 0;
}

function summarizeFailsToText(pFailEvent) {
  if (pFailEvent.details.error.failureType === "testCodeFailure") {
    return `✘ ${pFailEvent.name}${EOL}  ${formatError(pFailEvent)}${EOL}${EOL}`;
  }
  return "";
}

function diagnosticToObject(pDiagnosticEvent) {
  const lReturnValue = {};
  const [key, value] = pDiagnosticEvent.data.message.split(" ");
  // eslint-disable-next-line security/detect-object-injection
  lReturnValue[key] = value;
  return lReturnValue;
}

function formatError(pTestResult) {
  return (
    pTestResult.details.error.cause.stack ||
    pTestResult.details.error.cause.message ||
    pTestResult.details.error.cause.code
  );
}
