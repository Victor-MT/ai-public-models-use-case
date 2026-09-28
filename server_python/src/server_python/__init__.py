from flask.cli import cli


def main():
    cli.main(args=["--app", "main.py", "run"])