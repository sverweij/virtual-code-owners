## What?

This takes a

- VIRTUAL-CODEOWNERS file with (virtual) team names
- a `virtual-teams.yml` file which define the teams

... and churns out a CODEOWNERS with usernames

## Usage

```
npx virtual-code-owners VIRTUAL-CODEOWNERS virtual-teams.yml > .github/CODEOWNERS
```

## Why?

For organizations that have large mono repositories with loads of code owners, but
who don't (yet) can or want to use GitHub teams to arrange their tens or hundreds
of contributors, but who also don't want to manually manage a humongous
code -> people mapping in a CODEOWNERS file.

## Formats

### VIRTUAL-CODEOWNERS

Is a regular, valid GitHub [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners#codeowners-and-branch-protection) file.
The only difference between VIRTUAL-CODEOWNERS and a CODEOWNERS file is that
the _groups_ the former uses don't yet exist, except in a `virtual-groups.yml`.

Example:

```
# This is a comment
* @cloud-heroes-all

.github/ @ch/transversal
apps/broker @ch/transversal
apps/ux-portal/ @ch/ux @ch/transversal
apps/platform-shizzle/ @ch/transversal @william-the-fourth-ch
libs/ubc-sales/ @ch/sales
libs/ubc-after-sales/ @ch/after-sales
libs/ubc-pre-sales/ @ch/pre-sales
libs/components/ @ch/ux
libs/common/ @ch/transversal @ch/tgif
tools/ @ch/tgif
```

### virtual-teams.yml

Contains a list of groups, with for each group its team members, like so:

```yaml
- ch/after-sales
  - john-doe-ch
  - pete-peterson-ch
  - william-the-fourth-ch
- ch/sales
  - gregory-gregson-ch
  - jane-doe-ch
- ch/pre-sales
  - jean-claude-ch
  - valerie-valerton-ch
  - averel-dalton-ch
- ch/ux
  - davy-davidson-ch
  - john-johnson-ch
  - joe-dalton-ch
- ch/transversal
  - luke-the-lucky-ch
# etc
```

### Mixing real and virtual groups

It might be you already have a group or two defined, but just want to use
_additional_ groups. In that case just don't specify it in `group-mapping.yml`
and _virtual-code-owners_ will leave it alone.

### Having usernames in VIRTUAL-CODEOWNERS

This is possible as well - just make sure there's no name clashes between the
username and a (virtual) group name and _virtual-code-owners_ will leave
the real name alone.

### Limitations

Currently only works for _usernames_ and _team names_
