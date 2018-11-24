# Setting up Automatic SSH Authentication

## Step 1. Generating Key on Host Machine
```ssh
$ cd ~/.ssh
$ ssh-keygen -f [$ID_FILE_NAME] -t [$ALGORITHM_TYPE]
```

## Step 2. Setting SSH Configuration File on Host Machine
```bash
$ gedit ~/.ssh/config
$ # input target information
```
Put in the target information in the following format:
```
Host [$TARGET_IP]
    User [$DEFAULT_USER]
    IdentityFile [$ID_FILE_NAME]
```
Note that $ID_FILE_NAME is the same as the $ID_FILE_NAME in Step 1. If you use the default identity file (i.e. the id_rsa file), you don't need to put the IdentityFile line in ssh config.

## Step 3. Setting Authorized Key File on Target Machine
First, on the host machine, copy the content of the public key that is generated in Step 1.
Then, on the target machine, paste the content of the public key to the ~/.ssh/authorized_keys file
```sh
$ vi ~/.ssh/authorized_keys
$ # paste the content
```
After you are done, don't forget to change the permission file permission.
```
$ chmod 755 authorized_keys
```

Alternatively, you could do the following:
```
$ scp ~/.ssh/some_key.pub $TARGET_IP:~/.ssh/authorized_keys
```

## Related Readings
1. https://www.ssh.com/ssh/config/
1. https://www.ssh.com/ssh/keygen/
1. https://confluence.atlassian.com/bitbucketserver/creating-ssh-keys-776639788.html
