# Project BeachWorm Back-end

## First-time setup

`cd` into this directory and initialize a virtual environment with `virtualenv .`

Activate the virtual environment by running the *activate* script within the *scripts* subdirectory:

```
.\Scripts\activate
```
 
Run `pip install -r requirements.txt` to install the Python modules. If new requirements are added, just re-run this command.

Apply migrations by entering: `python manage.py migrate`

Finally, ensure you have the .env file (named exactly .env) saved in the \mainsite directory. This file contains necessary API keys, but is not saved by git for security reasons. It can be acquired in the Discord.

## Starting the Django server

`cd` into this directory and do the following:

1. Activate the venv: `.\Scripts\activate`
2. run `python manage.py runserver`

## Updating models

After making changes to the app models, there are two steps to apply these.

1. Create migrations. To do this, type `python manage.py makemigrations mainsite`. To include a descriptive name that will show up in the migrations list, type `python manage.py makemigrations mainsite -- name [DESCRIPTIVE_NAME_HERE]`. In either case, if there are any issues with your models, the output will advise you where and suggested fixes.
2. Apply the migrations by entering: `python manage.py migrate`

