## What?

This takes a

- VIRTUAL-CODEOWNERS.txt file with (virtual) teams
- a `virtual-teams.yml` file which define the teams

... and churns out a CODEOWNERS with user names.

## Usage

- Rename your `CODEOWNERS` to `VIRTUAL-CODEOWNERS.txt` and put team names in them.
- Specify team names that don't (yet) exist on GitHub level in a `virtual-teams.yml`
- Run this:

```
npx virtual-code-owners VIRTUAL-CODEOWNERS.txt virtual-teams.yml > .github/CODEOWNERS
```

## Why?

Organizations sometimes have large mono repositories with loads of code owners.
They or their bureaucracy haven't landed on actually using GitHub teams to clearly
demarcate that. Teams in those organizations who want to have clear code ownership
have the following choices:

- Wrestle the bureaucracy.  
  This is the recommended approach. It might take a while, though - and even
  though there are good people on many levels in bureaucracies, it might
  eventually not pan out because #reasons.
- Maintain a CODEOWNERS file with code assigned to large lists of individuals.  
  An option, but laborious to maintain.
- Use `virtual-code-owners`.

## Formats

### VIRTUAL-CODEOWNERS.txt

`VIRTUAL_CODEOWNERS.txt` is a regular, valid GitHub [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners#codeowners-and-branch-protection) file.
The only difference between VIRTUAL-CODEOWNERS and a CODEOWNERS file is that
the _teams_ the former uses might not exist yet, except in a `virtual-teams.yml`.

Example:

```
#! comments that start with #! won't appear in the CODEOWNERS output e.g.
#! this is not the CODEOWNERS file - to get that one run
#!   npx virtual-code-owners VIRTUAL-CODE-OWNERS.txt virtual-teams.yml > CODEOWNERS
#! on this.
#!
# Regular comments are retained
* @cloud-heroes-all
.github/ @ch/transversal
apps/broker @ch/transversal
apps/ux-portal/ @ch/ux @ch/transversal
libs/ubc-sales/ @ch/sales
libs/ubc-after-sales/ @ch/after-sales
libs/ubc-pre-sales/ @ch/pre-sales
libs/components/ @ch/ux
```

### virtual-teams.yml

A valid YAML file that contains a list of teams, with for each team its members:

```yaml
ch/after-sales:
  - john-doe-ch
  - pete-peterson-ch
  - william-the-fourth-ch
ch/sales:
  - gregory-gregson-ch
  - jane-doe-ch
ch/pre-sales:
  - jean-claude-ch
  - valerie-valerton-ch
  - averel-dalton-ch
ch/ux:
  - davy-davidson-ch
  - john-johnson-ch
  - joe-dalton-ch
ch/transversal:
  - luke-the-lucky-ch
# etc
```

## FAQ

### Can I mix real and virtual teams in `VIRTUAL-CODEOWNERS.txt`?

Yes.

It might be you already have a team or two defined, but just want to use
_additional_ teams. In that case just don't specify the already-defined teams
in `virtual-teams.yml` and _virtual-code-owners_ will leave them alone.

### Can I still use usernames in `VIRTUAL-CODEOWNERS.txt`

Yes.

Just make sure there's no name clashes between the username and a (virtual)
team name and _virtual-code-owners_ will leave the real name alone.

### Any limitations I should know of?

- Currently only works for _usernames_ to identify team members - not for e-mail
  addresses.
- If people are in more than one team, chances are they get mentioned multiple
  times on the same line if both teams are code owners of the same part of the
  code. While maybe not _looking_ ideal, the resulting code owners file is still
  valid & ready to rock'n roll.
- _virtual-code-owners_ assumes the VIRTUAL-CODEOWNERS.txt is a valid CODEOWNERS
  file and the virtual-teams.yml is a valid yaml file with teams names as keys
  and team members as arrays under these. It will likely throw errors when this
  assumption is not met, but the error-messages might not be as clear as possible.

### Why the `.txt` extension?

Various editors assume an ALL_CAPS file name with `#` characters on various lines
to be markdown, and will auto format them as such - making for either very ugly
or in worst cases invalid CODOWNERS files. Usually such autoformatting is not
present on text files.

Apparently these editors know about CODEOWNERS, though so this auto formatting
doesn't seem to be happening over there.
