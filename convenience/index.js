// require statments
const config = require('./config.js');
const chalk  = require('chalk');
const spawn  = require('child_process').spawn;

// variable definitions
var path = [];

// set up input and output
var stdin  = process.stdin;
var stdout = process.stdout;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

// create a space to write the menu items
createCanvas();

var menu = config;
displayMenu(menu);

// console.log(JSON.stringify(menu));
// console.log();

// on any data into stdin
stdin.on('data', function(key){
    if (key === '\u0003') {
        // ctrl-c (end of text)
        process.exit();
    } else if (key === '') {
        // backspace (back one menu)
        path.pop();
    } else {
        path.push(key);
    }

    var menu = config;
    for (let i = 0; i < path.length; i++) {
        menu = menu.items[path[i]];
    }

    if (menu === undefined) {
        path.pop();
        stdout.cursorTo(0);
        stdout.clearLine();
        stdout.write(chalk.red('Key "' + key + '" has no mapping!'));
    } else {
        if (menu.items === undefined) {
            clear();
            runCommand(menu.action);
        } else {
            displayMenu(menu);
        }
    }
});

function displayMenu(menu) {
    clear();

    stdout.write(menu.title + '\n\n');

    for (const key in menu.items) {
        const item = menu.items[key];

        if (item.items === undefined) {
            // this item is an action
            stdout.write(chalk.yellow(key + ' - ' + item.title + '\n'));
        } else {
            // this item is a dir
            stdout.write(chalk.blue(key + ' - ' + item.title + '\n'));
        }
    }

    stdout.write('\n');
}

function createCanvas() {
    // fill the screen with blank lines
    for (let i = 0; i < stdout.rows - 1; i++) {
        stdout.write('\n');
    }

    // then return to the top
    stdout.cursorTo(0, 0);
}

function clear() {
    // run through the console and clear all text
    for (let i = 0; i < stdout.rows; i++) {
        stdout.cursorTo(0, i);
        stdout.clearLine();
    }

    // then return to the top
    stdout.cursorTo(0, 0);
}

function runCommand(action) {
    command = spawn(action.command, action.params, { stdio: 'inherit' });

    command.on('exit', function (code) {
        process.exit(code);
    });
}