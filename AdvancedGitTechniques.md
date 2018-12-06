# Advanced Git Techniques

- [Advanced Git Techniques](#advanced-git-techniques)
  - [Git Workflow](#git-workflow)
  - [Git Commit Symbols](#git-commit-symbols)
  - [Git Rebase](#git-rebase)
    - [Elementary Git Rebase](#elementary-git-rebase)
    - [Using Git Rebase to Delete Commit](#using-git-rebase-to-delete-commit)
    - [Multiple People Collaborate on the Same Branch](#multiple-people-collaborate-on-the-same-branch)
    - [Git Rebase Conflict Resolution](#git-rebase-conflict-resolution)
  - [Git Stash](#git-stash)
  - [Git Reset](#git-reset)
    - [Reverting a Commit](#reverting-a-commit)
    - [Removing a Commit From Remote](#removing-a-commit-from-remote)
  - [Hunk Manipulations](#hunk-manipulations)
    - [Selectively Reverse Hunks](#selectively-reverse-hunks)
    - [Selectively Stage Hunks](#selectively-stage-hunks)
    - [Selectively Unstage Hunks](#selectively-unstage-hunks)
  - [Conflict Resolution](#conflict-resolution)
    - [Relavant Terminology](#relavant-terminology)
    - [Configuring Merge Tool](#configuring-merge-tool)
    - [kdiff3 Workflow](#kdiff3-workflow)
  - [Additional Readings](#additional-readings)

## Git Workflow

**Repository** is the "container" that tracks the changes to your project files. It holds all the commits.

**Working Tree**, or working directory, consists of files that you are currently working on. 

**Index**, or **staging area** compares the files in the working tree to the files in the repo. 

Knowing these terms are essential to understand the typical _modify -> stage -> commit_ git flow.

## Git Commit Symbols

```bash
git show $COMMIT_ID # a long hash
git show c82a22c3 # first few characters are sufficient

git show HEAD # the tip of current branch
git show feature # the tip of 'feature' branch
```

To select a parent commit:

```bash
git show HEAD~1
git show HEAD^ # the parent of HEAD

git show HEAD~2
git show HEAD^^ # the grandparent of HEAD

git show HEAD^1 # first parent (same as HEAD^)
git show HEAD^2 # second parent (upstream branch)
```

## Git Rebase

Normally git rebase is not needed, knowing git rebase and how it works could make the gitk tree much prettier, and save a lot of headaches.

To learn more about git rebase, see Additional Readings.

### Elementary Git Rebase

Assume you're on feature branch, you want to _rebase_ to the latest commit of the develop branch.

```git
git rebase develop
git rebase develop feature
```

Assume you want to _rebase_ the feature branch from the develop branch onto master branch:

```git
git rebase --onto master develop feature
```

### Using Git Rebase to Delete Commit

If you are on a feature branch and you wish to remove commit F and G from the below diagram

```demo
E---F---G---H---I---J  feature (before rebase)
E---H---I---J  feature (after rebase)
```

You could do:

```git
git rebase --onto feature~5 feature~3 feature
```

### Multiple People Collaborate on the Same Branch

Fetching works the same as if you're on an individual branch, but before you push anything, do:

```git
git pull --rebase
git push
```

### Git Rebase Conflict Resolution

The commits are rewinded and collected in a stack. These commits are then popped one by one onto the new upstream. When a conflict occurs, resolve the conflict on the spot, then do:

```git
git add .
git rebase --continue
```

If you decides to be a loser and give up, do:

```git
git rebase --abort
```

## Git Stash

```bash
git stash
git stash apply
git stash pop # discard stash after apply
```

If you want to name a stash.

```bash
git stash save $STASH_NAME # name a stash
git stash apply $STASH_NAME # apply the named stash
```

Apply a particular stash:

```bash
$ git stash list
stash@{0}: WIP on master: 049d078 second stash
stash@{1}: WIP on master: c264051 initial stash
$ git stash apply stash@{1}
```

Remove all stashes:

```bash
git stash clear
```

## Git Reset

The default reset mode is `--mixed`

```bash
git reset [$MODE] [$COMMIT_ID] # discard all changes
```

`$MODE` could be `--soft`, `--mixed`, or `--hard`.

In the simplest terms:

* `--soft`: **uncommit** changes, changes are left staged (index).
* `--mixed` (default): **uncommit** + **unstage** changes, changes are left in working tree.
* `--hard`: **uncommit** + **unstage** + **delete** changes, nothing left.

### Reverting a Commit

Reverting a commit is generally safer than resetting.

```bash
git revert [$COMMIT_ID] 
```

In case of conflict, resolve the conflict on the fly, and:

```git
git revert --continue
git revert --abort
```

### Removing a Commit From Remote

Warning: people may hate you for doing this.

```bash
git reset --hard $COMMIT_ID
git push -F
```

## Hunk Manipulations

The `-p` option will allow you to interactively select hunks. 

### Selectively Reverse Hunks

```bash
git checkout -p $COMMIT_ID -- $FILE_PATH
```

The `$COMMIT_ID` specifies the commit that you want to *take the file state from*. This means that all changes made between `$COMMIT_ID` and current commit are checked. Note that the first command excludes the changes made in `$COMMIT_ID`.

You are usually given these options `[y,n,q,a,d,s,e,?]`? The details are in the interactive manual, but below are all you need to worry about:

* `s` - split the current hunk into smaller hunks
* `e` - manually edit the current hunk

### Selectively Stage Hunks

```bash
git add -p
```

Alternatively, you can do:

```bash
git add -i
```

In the interactive prompt, type `5` or `p` for patch. 

### Selectively Unstage Hunks

```bash
git reset -p
```

## Conflict Resolution

### Relavant Terminology

* `LOCAL` is the head of the current branch
* `REMOTE` is the head of the remote location that you are trying to merge into your `LOCAL` branch
* `BASE` is the common ancestor of `LOCAL` and `BASE`

### Configuring Merge Tool

Visual Studio Code offers great support for on-the-fly conflict resolution. Simply choose the desired version, save, stage and commit.

It also doesn't hurt to use kdiff3.

```git
sudo apt-get install kdiff3

git config merge.tool kdiff3
git config merge.conflictstyle diff3
git config mergetool.prompt false
```

### kdiff3 Workflow

1. On local branch feature, attempt `git merge develop` and expect a merge conflict (feature|MERGING). Then, run `git mergetool`.
2. The kdiff3 window will then pop up. Pokes around the buttons in the navigation bar (don't click merge). Step through all the conflicts (even those that are automatically resolved) to ensure that the correct version (A|B|C) is chosen. Then save and close.
3. `git rebase --continue` if you are using Git version 2.12 or later. Otherwise, stage and commit the changes and the merge will be complete (old fashioned way).

## Additional Readings

Git Workflow:

1. https://backlog.com/git-tutorial/git-workflow/

Git Commit Symbols:

1. https://git-scm.com/docs/gittutorial

Git Rebase:

1. https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase
2. https://git-scm.com/docs/git-rebase
3. https://linux.die.net/man/1/git-rebase

Git Stash:

https://git-scm.com/book/en/v1/Git-Tools-Stashing

Git Reset:

1. https://git-scm.com/docs/git-reset
2. https://git-scm.com/docs/git-revert
3. https://stackoverflow.com/questions/3528245/whats-the-difference-between-git-reset-mixed-soft-and-hard#answer-50022436

Manipulating Hunks:

1. https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging
2. https://stackoverflow.com/questions/4248237/how-do-i-reverse-a-specific-hunk-of-a-commit-in-git
3. https://stackoverflow.com/questions/7336966/git-interactive-unstage 

Conflict Resolution:
1. https://gist.github.com/karenyyng/f19ff75c60f18b4b8149