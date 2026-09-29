from flask.cli import cli
import sys


def main():
    cli.main(args=["--app", "main.py", "run", *sys.argv[1:]])