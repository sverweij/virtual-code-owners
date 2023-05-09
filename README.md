## What?

This takes a

- VIRTUAL-CODEOWNERS.txt file with (virtual) teams
- a `virtual-teams.yml` file which define the teams

... and merges them into a CODEOWNERS with user names.

## Usage

- Rename your `.github/CODEOWNERS` to `.github/VIRTUAL-CODEOWNERS.txt` and put team names in them.
- Specify team names that don't (yet) exist on GitHub level in a `.github/virtual-teams.yml`
- Run this:

```
npx virtual-code-owners
```

or, if you want to be verbose

```
npx virtual-code-owners \
  --virtual-code-owners .github/VIRTUAL-CODEOWNERS.txt \
  --virtual-teams       .github/virtual-teams.yml \
  --code-owners         .github/CODEOWNERS
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
  An option, but laborious to maintain, even for smaller projects; for example:

```CODEOWNERS
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
```

This is where `virtual-code-owners` comes in.

## Formats

### VIRTUAL-CODEOWNERS.txt

`VIRTUAL_CODEOWNERS.txt` is a regular, valid GitHub [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) file.
The only difference between VIRTUAL-CODEOWNERS.txt and a CODEOWNERS file is that
the _teams_ the former uses might not exist yet, except in a `virtual-teams.yml`.
This enables you to write a _much_ easier to maintain list of code owners.

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
```

### virtual-teams.yml

A valid YAML file that contains a list of teams, with for each team its members.
If a new team member joins, you can enter it here, run `npx virtual-code-owners`
to update CODEOWNERS.

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

## FAQ

### Can I mix real and virtual teams in `VIRTUAL-CODEOWNERS.txt`?

Yes.

It might be you already have a team or two defined, but just want to use
_additional_ teams. In that case just don't specify the already-defined teams
in `virtual-teams.yml` and _virtual-code-owners_ will leave them alone.

### Can I still use usernames in `VIRTUAL-CODEOWNERS.txt`?

Yes.

Just make sure there's no name clashes between the username and a (virtual)
team name and _virtual-code-owners_ will leave the real name alone.

### Any limitations I should know of?

- Currently only works for _usernames_ to identify team members - not for e-mail
  addresses.
- _virtual-code-owners_ assumes the VIRTUAL-CODEOWNERS.txt is a valid CODEOWNERS
  file and the virtual-teams.yml is a valid yaml file with teams names as keys
  and team members as arrays under these. It will likely throw errors when this
  assumption is not met, but the error-messages might be cryptic.

### Why the `.txt` extension?

Various editors assume an ALL_CAPS file name with `#` characters on various lines
to be markdown, and will auto format them as such - making for either very ugly
or in worst cases invalid CODOWNERS files. Usually such autoformatting is not
present on text files.

Apparently these editors know about CODEOWNERS, though so this auto formatting
doesn't seem to be happening over there.

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
