## What?

This generates a `CODEOWNERS` (_patterns_ x _users_) from

- a `VIRTUAL-CODEOWNERS.txt` (_patterns_ x _teams_)
- a `virtual-teams.yml` (_teams_ x _users_)

... which eases keeping your CODEOWNERS in sync on multi-team mono repos.

(Especially when the teams are not defined on GitHub level).

## Usage

- Rename your `.github/CODEOWNERS` to `.github/VIRTUAL-CODEOWNERS.txt` and put team names in them.
- Define teams that don't (yet) exist on GitHub level in `.github/virtual-teams.yml`
- Run this:

```
npx virtual-code-owners
```

## Formats

### VIRTUAL-CODEOWNERS.txt

`VIRTUAL-CODEOWNERS.txt` sticks to the [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) format,
but adds the ability to include teams defined in `virtual-teams.yml`.

For example the CODEOWNERS file above can then look like this:

```CODEOWNERS
#! comments that start with #! won't appear in the CODEOWNERS output
#!
#! this is not the CODEOWNERS file - to get that one run
#!   npx virtual-code-owners
#!
# catch-all to ensure there at least _is_ a code owner, even when
# it's _everyone_

* @cloud-heroes-all

# admin & ci stuff => transversal

.github/                @ch/transversal

# generic stuff

apps/framework/         @ch/transversal
apps/ux-portal/         @ch/ux @ch/transversal
libs/components/        @ch/ux

# specific functionality

libs/ubc-sales/         @ch/sales
libs/ubc-after-sales/   @ch/after-sales
libs/ubc-pre-sales/     @ch/pre-sales
libs/ubc-refund/        @ch/sales @ch/after-sales
libs/ubc-baarden/       @ch/mannen-met-baarden
```

### virtual-teams.yml

A valid YAML file that contains a list of teams and their members.
Update it whenever you have new team members and run `npx virtual-code-owners`
to keep CODEOWNERS current.

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/sverweij/virtual-code-owners/main/src/virtual-teams.schema.json
ch/after-sales:
  - john-doe-ch
  - pete-peterson-ch
  - william-the-fourth-ch
  - daisy-duck
  - donald-duck
ch/sales:
  - gregory-gregson-ch
  - jane-doe-ch
  - abraham-ableton-ch
  - boris-bubbleblower-ch
  - charlotte-charleston-ch
  - dagny-taggert-ch
  - karl-marx-ch
ch/pre-sales:
  - jean-claude-ch
  - valerie-valerton-ch
  - averel-dalton-ch
  - john-galt-ch
ch/ux:
  - davy-davidson-ch
  - john-johnson-ch
  - joe-dalton-ch
  - koos-koets
  - charlotte-de-bourbon-ch
ch/transversal:
  - mary-the-merry-ch
  - luke-the-lucky-ch
  - naomi-the-namegiver-ch
  - benjamin-franklin
  - koos-koets
  - abraham-lincoln
```

### CODEOWNERS

Running `npx virtual-code-owners` would combine this into a CODEOWNERS file like this:

```CODEOWNERS
#
# DO NOT EDIT - this file is generated and your edits will be overwritten
#
# To make changes:
#
#   - edit .github/VIRTUAL-CODEOWNERS.txt
#   - and/ or add team members to .github/virtual-teams.yml
#   - run 'npx virtual-code-owners' (or 'npx virtual-code-owners --emitLabeler' if you also
#     want to generate a .github/labeler.yml)
#

# catch-all to ensure there at least _is_ a code owner, even when
# it's _everyone_

* @cloud-heroes-all

# admin & ci stuff => transversal

.github/                @abraham-lincoln @benjamin-franklin @koos-koets @luke-the-lucky-ch @mary-the-merry-ch @naomi-the-namegiver-ch

# generic stuff

apps/framework/         @abraham-lincoln @benjamin-franklin @koos-koets @luke-the-lucky-ch @mary-the-merry-ch @naomi-the-namegiver-ch
apps/ux-portal/         @abraham-lincoln @benjamin-franklin @charlotte-de-bourbon-ch @davy-davidson-ch @joe-dalton-ch @john-johnson-ch @koos-koets @luke-the-lucky-ch @mary-the-merry-ch @naomi-the-namegiver-ch
libs/components/        @charlotte-de-bourbon-ch @davy-davidson-ch @joe-dalton-ch @john-johnson-ch @koos-koets

# specific functionality

libs/ubc-sales/         @abraham-ableton-ch @boris-bubbleblower-ch @charlotte-charleston-ch @dagny-taggert-ch @gregory-gregson-ch @jane-doe-ch @karl-marx-ch
libs/ubc-after-sales/   @daisy-duck @donald-duck @john-doe-ch @pete-peterson-ch @william-the-fourth-ch
libs/ubc-pre-sales/     @averel-dalton-ch @jean-claude-ch @john-galt-ch @valerie-valerton-ch
libs/ubc-refund/        @abraham-ableton-ch @boris-bubbleblower-ch @charlotte-charleston-ch @dagny-taggert-ch @daisy-duck @donald-duck @gregory-gregson-ch @jane-doe-ch @john-doe-ch @karl-marx-ch @pete-peterson-ch @william-the-fourth-ch
libs/ubc-baarden/       jan@example.com korneel@example.com pier@example.com tjorus@example.com
```

## FAQ

### Any gotcha's?

It won't check whether the users or teams you entered exist.

### Do I have to run this each time I edit `VIRTUAL-CODEOWNERS.txt`?

Yes. But please automate this for your own sake.

You can for instance set up a rule for `lint-staged` in a `.lintstagedrc.json`
like this:

```json
{
  ".github/{VIRTUAL-CODEOWNERS.txt,virtual-teams.yml}": [
    "virtual-code-owners",
    "git add ."
  ]
}
```

### Can I mix real and virtual teams in `VIRTUAL-CODEOWNERS.txt`?

Yes.

It might be you already have a team or two defined, but just want to use
_additional_ teams. In that case just don't specify the already-defined teams
in `virtual-teams.yml` and _virtual-code-owners_ will leave them alone.

### Can I still use usernames in `VIRTUAL-CODEOWNERS.txt`?

Yes.

Just make sure there's no name clashes between the username and a (virtual)
team name and _virtual-code-owners_ will leave the real name alone.

### Can I automatically label PR's for virtual teams?

Yep.

Use [actions/labeler](https://github.com/actions/labeler) and tickle
`virtual-code-owners` to generate the labeler config file:

```sh
npx virtual-code-owners --emitLabeler
# Wrote .github/CODEOWNERS AND .github/labeler.yml
```

If you have an alternate file location for the `labeler.yml` you can specify that
with virtual-code-owner's `--labelerLocation` parameter.

### What validations does virtual-code-owners perform?

virtual-code-owners checks for basic CODEOWNERS format errors and invalid
user/team names but doesn't verify their existence in the project.

- valid user/team names start with an `@` or are an e-mail address
- valid rules have a file pattern and at least one user/team name

### I want to specify different locations for the files (e.g. because I'm using GitLab)

Here you go:

```
npx virtual-code-owners \
  --virtualCodeOwners .gitlab/VIRTUAL-CODEOWNERS.txt \
  --virtualTeams      .gitlab/virtual-teams.yml \
  --codeOwners        .gitlab/CODEOWNERS
```

### Can I just validate VIRTUAL-CODEOWNERS.txt & virtual-teams.yml without generating output?

So _without_ generating any output?

Sure thing. Use `--dryRun`:

```
npx virtual-code-owners --dryRun
```

### Why the `.txt` extension?

It keeps editors and IDE's from messing up your formatting.

Various editors assume an ALL_CAPS file name with `#` characters on various lines
to be markdown, and will auto format them as such. This makes for either very ugly
or in worst cases invalid CODEOWNERS files. Usually such autoformatting is not
present on text files.

Apparently these editors know about CODEOWNERS, though, so they don't mess with
the formatting of _those_.

### Why does this exist at all? Why not just use GitHub teams?

You should _totally_ use GitHub teams! If you can.

Organizations sometimes have large mono repositories with loads of code owners.
They or their bureaucracy haven't landed on actually using GitHub teams to clearly
demarcate that. Or you're working on a cross-functional team that doesn't follow
the organization chart (and hence the GitHub teams). Teams in those organizations
who want to have clear code ownership have the following choices:

- Wrestle the bureaucracy.  
  This is the recommended approach. It might take a while, though - and even
  though there are good people on many levels in bureaucracies, it might
  eventually not pan out because #reasons.
- Maintain a CODEOWNERS file with code assigned to large lists of individuals.  
  An option, but laborious to maintain, even for smaller projects

This is where `virtual-code-owners` comes in.
