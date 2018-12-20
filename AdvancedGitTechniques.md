# Advanced Git Techniques

- [Advanced Git Techniques](#advanced-git-techniques)
  - [Git Workflow](#git-workflow)
    - [Basic Structure](#basic-structure)
    - [Tagging](#tagging)
    - [Git Objects](#git-objects)
    - [Git References](#git-references)
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
  - [Setting Up Git Server](#setting-up-git-server)
    - [Security Recommendation (Server)](#security-recommendation-server)
    - [Step 1. Adding Dedicated SSH Key (Client)](#step-1-adding-dedicated-ssh-key-client)
    - [Step 2. Add Private Key to ssh-agent (Client)](#step-2-add-private-key-to-ssh-agent-client)
      - [Version A](#version-a)
      - [Version B](#version-b)
    - [Step 3. Initializing Repo and Point Remote Origin To Server (Client)](#step-3-initializing-repo-and-point-remote-origin-to-server-client)
  - [Git Hooks](#git-hooks)
    - [Client-Side Hooks](#client-side-hooks)
    - [Server-Side Hooks](#server-side-hooks)
    - [Triggering Build on the Server](#triggering-build-on-the-server)
      - [Build Server Script](#build-server-script)
      - [Client Signal Script](#client-signal-script)
  - [Additional Readings](#additional-readings)

## Git Workflow

This section is terminology oriented.
It is important to have an in-depth understanding of Git's internal structure and operating mechanism to use it more effectively.

### Basic Structure

**Repository** is the "container" that tracks the changes to your project files. It holds all the commits.

**HEAD** is the last commit snapshot.

**Working Tree**, or working directory, is the sandbox consists of files that you are currently working on.

**Index**, or **staging area** is the proposed next-commit snapshot.

### Tagging

Git has the ability to tag specific points in history as being important.

**Lightweight Tags** are very much like branches that doesn't change, they're just pointer to a specific commit.
**Annotated Tags** are full objects in the Git database. They’re checksummed; contain the tagger name, email, and date; have a tagging message; and can be signed and verified with GNU Privacy Guard.

To create a _lightweight tag_:

```bash
git tag v1.4
git tag -u $COMMIT_ID v1.4
```

To create an _annotated tag_:

```bash
git tag -a v1.4 -m "my version 1.4"
git tag -a v1.4 -u $COMMIT_ID -m "my version 1.4"
```

### Git Objects

Git is a content-addressable filesystem.
The core of Git is a simple key-value data store.
You can insert any kind of content into Git repository, for which Git will hand you back a unique key.

### Git References

Git commits are identified through a raw SHA-1 values.
Git references are simple names that represents certain SHA-1 values.
These certain names are stored in `$REPO_PATH/.git/refs`.

### Git Commit Symbols

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

## Setting Up Git Server

Normally, there is no need to set up a git server for us mortals.
Knowing how to set up a Git Server is useful in the following scenario.

Suppose you have a windows desktop, but you are working on a project that requires cross compilation.
The compiled binaries and artifacts will be run on one or more target machines with a different OS and architectures (e.g. aarch64le QNX).
You have a Ubuntu 18.04 virtual machine that has all the pre-prepared tools and packages to deal with such cross compilation.
You obviously would choose to set up the development environment in the Ubuntu VM.

However, after trying for a few months, you realize that Ubuntu is extremely slow. The keystroke lags, and the cursor clicks keep becoming unresponsive. Moreover, it gets a lot worse when the repo is building, the CPU usage is always at high ninety percent (`make -j4`), and it usually takes more than half an hour to finish a clean rebuild.
On the other hand, you noticed that coding in Windows never lags or becomes unresponsive, even when the Ubuntu VM is building the repo.
Your faith in your little Ubuntu VM has weakened, and you now wish to move the development environment to Windows.

Moving the whole development environment to windows is very expensive, as you have to figure out ways to install all the required tools, e.g. google repo tools, GNU make, cmake etc. You probably have to use cygwin to get clang or gcc, and cross-compile qcc with them, and then use qcc to compile the source code. The whole idea is just not realistic.

A much easier approach is to set up a git server with the Ubuntu VM.
On the Windows desktop, init and setup the relevant git repos with remote origin pointing to the git server at Ubuntu.
Whenever you make changes, you could simply `push` the commits to the git server at Ubuntu, and then build and test the changes there. The build and testing on the Ubuntu VM could be triggered automatically by the `push`.
This way, you could develop on the Windows Desktop without having to spend weeks setting up a whole new development environment.

### Security Recommendation (Server)

Before proceeding to the following steps, it is recommended that you create a dedicated user to host the git repos and to store the authorized SSH keys.
The recommended username is 'git'.

```bash
sudo adduser git
su git
cd
mkdir .ssh && chmod 700 .ssh
touch .ssh/authorized_keys && chmod 600 .ssh/authorized_keys
```

### Step 1. Adding Dedicated SSH Key (Client)

It is a good idea to use a dedicated ssh key for git other than id_rsa.
This follows the usual SSH auto-authentication setup.

1. Generate SSH key on client machine.
2. Configure the `~/.ssh/authorized_keys` on server.
3. Configure `~/.ssh/config` on client machine.
4. Test that the auto-authentication works by SSH into the server.

If the client machine is windows, then the user has no choice but to add the key through **git bash**.
**Do not use PuTTYgen as the key format is not recognized by git bash!**

To generate a recognized SSH key on windows, do:

```bash
# again, in git bash (if the client machine is Windows)
ssh-keygen -t rsa -b 4096 -C "github_email@example.com"
# please leave the passphrase blank for goodness sake
```

### Step 2. Add Private Key to ssh-agent (Client)

In order to work with repo server without manual authentication, you must add the key to the ssh agent in addition to the auto-authentication setup.
To do so:

```bash
# start the ssh-agent in the background
eval $(ssh-agent -s)

ssh-add $PATH_TO_PRIVATE_KEY
```

Where `$PATH_TO_PRIVATE_KEY` is the private key generated in Step 1.

Unfortunately, you **must** run these two commands everytime you start a new git bash shell which is extremely painful.
To automatically run these command, you could add the following lines (version A and version B) to `~/.bashrc` or `~/.profile`,

#### Version A

This is provided in the [GitHub Help](https://help.github.com/articles/working-with-ssh-key-passphrases/).

```bash
env=~/.ssh/agent.env

agent_load_env () { test -f "$env" && . "$env" >| /dev/null ; }
agent_start () {
    (umask 077; ssh-agent >| "$env")
    . "$env" >| /dev/null ; }

agent_load_env

# agent_run_state: 0=agent running w/ key; 1=agent w/o key; 2= agent not running
agent_run_state=$(ssh-add -l >| /dev/null 2>&1; echo $?)

if [ ! "$SSH_AUTH_SOCK" ] || [ $agent_run_state = 2 ]; then
    agent_start
    ssh-add $PATH_TO_PRIVATE_KEY
elif [ "$SSH_AUTH_SOCK" ] && [ $agent_run_state = 1 ]; then
    ssh-add $PATH_TO_PRIVATE_KEY
fi

unset env
```

#### Version B

This is my own version, instead of always letting the agent run in detached thread.
I always kill all previous agent processes before starting a new one.

```bash
TASKKILL //F //IM ssh-agent.exe
eval $(ssh-agent -s)
ssh-add $PATH_TO_PRIVATE_KEY
```

Do not blame me for cheating and using Windows cmd, git bash does not have `pkill` command! The double slashes are to escape the special '/' character.

### Step 3. Initializing Repo and Point Remote Origin To Server (Client)

Initializing repo:

```bash
mkdir TestRepo && cd TestRepo
git init
```

Add Server Remote Origin:

```bash
git remote add origin git@$SERVER_IP:$PATH_TO_SERVER_REPO
```

In this command, it is assumed that the repo in the server is hosted under the user 'git'. `$PATH_TO_SERVER_REPO` is the path to the remote repo.

Now, you should be on the `master` branch, and you could start pulling and pushing.

```bash
git fetch
git pull origin master
git checkout develop
git pull
```

## Git Hooks

Git hooks are scripts triggered by git operations.
They are stored in `$REPO_PATH/.git/hooks/` with designated names.
Git hooks are particularly useful for Continuous Integration and Continuous Deployment.

In my case introduced in _Git Server_ section, using git hooks could save a noticeable amount of time for each development cycle.
For example, I could set up git hooks on the git server to build the current branch and run the unit tests as soon as I push from the git client machine, and notify me of the results.
The obvious benifit of this is that I could continue to focus on my repo after I have pushed, while the git server on the virtual machine is validating my changes.
I do not have to SSH into the VM, run the build, execute the test binaries and validate manually.

### Client-Side Hooks

- **pre-commit**: runs before Git asks for a commit message or generates a commit object.
  - No arguments.
  - Exiting with non-zero status aborts the commit.
- **post-commit**: runs after a commit.
  - No arguments.
- **post-checkout**: runs after a successful `git checkout`.
- **post-merge**: runs after a successful merge.
- **pre-push**: runs after remote refs have been updated but before any objects have been transferred.

### Server-Side Hooks

- **pre-receive**: runs only once before receiving a push.
- **update**: runs once for each branch the pusher is trying to update.
- **post-receive**: runs after receiving the push.

### Triggering Build on the Server

#### Build Server Script

First, set up a UDP server waiting to be triggered. The python script looks like this:

```python
#/usr/bin/python3

import socket
import subprocess

## encoding and decoding using utf-8
def serve_forever():
    address = ('127.0.0.1', 2018) #AF_INET
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(address)

    while True:
        try:
            data, addr = sock.recvfrom(4096)
            print('received %s bytes' % (len(data),))
            if data:
                items = data.decode("utf-8").split()
                repo = items[0]
                br = items[1]
                if (repo == 'reponame'):
                    checkout_latest(br)
                    build_repo()
        except Exception as e:
            print(e)
            pass

## local build module:
goto_root = "cd %s" %("repo_root",) #repo root
setup_cmd = "source env_setup.sh" #customized setup (e.g. source before build)

def checkout_latest(branch_name):
    global goto_root
    cmd = goto_root + " && git checkout " + branch_name + " && git reset --hard"
    run(cmd)

def build_repo():
    global setup_cmd
    cmd = setup_cmd + " && ./build_script.sh"
    run(cmd)

def run(cmd):
    pr = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

    while True:
        """ Aggressive buffering to achieve real-time output """
        output = pr.stdout.readline()
        if output == b'' and pr.poll() is not None:
            break
        if output:
            print(output.strip())
    rc = pr.poll()
    if rc != 0:
        print("FAILED!")
    return rc

if __name__ == "__main__":
    print("Starts serving ...")
    serve_forever()

    print("Quitting ...")
```

Note that this script is only suitable for personal use, because the output will mess up if a push signal is received when the repo is still building.
To handle signal racing, simply refactor the script to use queueing.

#### Client Signal Script

Inside .git/hooks, add `post-receive` that sends a signal to the build server:

```python
#!/usr/bin/python3
import sys
import socket

repo_name = "repo msg"
branch_name = sys.stdin.readlines()[0].split()[2].split('/')[2]

address = ('127.0.0.1', 2018) #AF_INET
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

msg = repo_name + " " + branch_name
print("Notifying build server to update "+branch_name+" ...")

sock.sendto(msg.encode("utf-8"), address)
print("Notified build server ... Done")
```

## Additional Readings

Git Workflow:

- [Main Reference](https://backlog.com/git-tutorial/git-workflow/)
- [Official SCM Doc on Basic Git Trees](https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified)
- [Official SCM Git Reference Documentation](https://git-scm.com/book/en/v2/Git-Internals-Git-References)
- [Official SCM Git Objects Documentation](https://git-scm.com/book/en/v2/Git-Internals-Git-References)
- [Official SCM Git Tagging Documentation](https://git-scm.com/book/en/v2/Git-Basics-Tagging)

Git Commit Symbols:

- [Official SCM Documentation](https://git-scm.com/docs/gittutorial)

Git Rebase:

- [Atlassian Tutorial](https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase)
- [Official SCM Documentation](https://git-scm.com/docs/git-rebase)
- [Other Tutorial](https://linux.die.net/man/1/git-rebase)

Git Stash:

- [Official SCM Documentation](https://git-scm.com/book/en/v1/Git-Tools-Stashing)

Git Reset:

- [Official SCM Documentation on Git Reset](https://git-scm.com/docs/git-reset)
- [Official SCM Documentation on Git Revert](https://git-scm.com/docs/git-revert)
- [Helpful Post Clarifying Reset Types](https://stackoverflow.com/questions/3528245/whats-the-difference-between-git-reset-mixed-soft-and-hard#answer-50022436)

Manipulating Hunks:

- [Official SCM Documentation](https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging)
- [Helpful Post on Revert Hunks](https://stackoverflow.com/questions/4248237/how-do-i-reverse-a-specific-hunk-of-a-commit-in-git)
- [Helpful Post on Interactive Unstage](https://stackoverflow.com/questions/7336966/git-interactive-unstage)

Conflict Resolution:

- [Additional Reading](https://gist.github.com/karenyyng/f19ff75c60f18b4b8149)

Setting Up Git Server:

- [Official SCM Documentation](https://git-scm.com/book/en/v2/Git-on-the-Server-Setting-Up-the-Server)
- [Adding Key to SSH Agent](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)
- [Git SSH Agent Auto Authentication](https://help.github.com/articles/working-with-ssh-key-passphrases/)

Git Hooks:

- [Official SCM Documentation](https://git-scm.com/book/uz/v2/Customizing-Git-Git-Hooks)
- [Atlassian Tutorial](https://www.atlassian.com/git/tutorials/git-hooks)