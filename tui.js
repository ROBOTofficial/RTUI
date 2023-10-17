const blessed = require("blessed")
const contrib = require("blessed-contrib")
const {exec,execSync,spawn} = require("child_process")
const { io } = require("socket.io-client")
const fs = require("fs")
const path = require("path")


function tui() {
    const screen = blessed.screen({
        smartCSR: true,
        title: 'DP TUI',
    })

    const grid = new contrib.grid({
        rows: 40,
        cols: 40,
        screen
    })

    let monitar = grid.set(0,15,31,25, blessed.list, {
        label:"Monitar"
    })
    let panel = grid.set(20,0,12,15, blessed.list, {
        label:"PANEL"
    })

    const tree = grid.set(0,0,20,15, contrib.tree, {
        label:"COMMAND-LIST",
        fg:"green",
    })
    tree.focus()

    const cpu = grid.set(31,0,10,7, contrib.gauge, {
        label:"CPU",
        stroke:'cyan', 
        fill:'white'
    })
    const memory = grid.set(31,7,10,8, contrib.gauge, {
        label:"Memory",
        stroke:'cyan', 
        fill:'white'
    })
    cpu.setPercent(25)
    memory.setPercent(25)

    const log = grid.set(31,15,10,25, contrib.log, {
        label:"LOG",
        fg: "green", 
        selectedFg: "green", 
    })

    tree.on("select", node => {
        log.log(node.name)
    })

    function tree_data() {
        let plugin = {}
        let p_list = fs.readdirSync(`${__dirname}\\plugin`)
        for ( i in p_list) {
            for ( o in fs.readdirSync(`${__dirname}\\plugin\\${p_list[i]}`)) {
                if (path.extname(fs.readdirSync(`${__dirname}\\plugin\\${p_list[i]}`)[o]) == ".json") {
                    plugin[p_list[i]] = {}; plugin[p_list[i]]["children"] = {}
                    plugin[p_list[i]]["children"][path.parse(fs.readdirSync(`${__dirname}\\plugin\\${p_list[i]}`)[o]).name] = {}
                }
            }
        }
        tree.setData({ 
            extended: true, 
                children:{
                    "SHOW GRAPH":{},
                    "SETTINGS":{
                        children:{
                            "SYSTEM-JSON":{}
                        }
                    },
                    "WAYS":{},
                    "PORT":{},
                    "PLUGIN-SETTINGS":{
                        children:plugin
                    },
                }
            }
        )
        screen.render()
    }

    function clog(content) {
        log.log(content)
        screen.render()
    }

    function start() {
        screen.render()
    }
    
    tree_data()

    //log catching
    process.on('uncaughtException', async err => {
        await log.log(err)
    });
    console.log = function(content) {log.log(content)}
    
    screen.render()
    screen.key(['escape'], () => {
        process.exit(0)
    });
}


execSync("mode 140,35")
setTimeout(async () => {
    await tui()
}, 1000);
