const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const server = new WebSocket.Server({
    port: 8085
});

var topics = new Array();
var groceryLists = new Array();

server.on('connection', socket => {
    
    socket.on('message', msg => {
        console.log(msg);
        let request = JSON.parse(msg);

        const requestId = request.id;
        const resultTopics = topics.filter(topic => topic.id === requestId);

        console.log('Encontrou ' + resultTopics.length + ' resultado');

        if (resultTopics.length === 0) { // se não existir o topico, ele cria
            const id = uuidv4();
            topics.push({
                id: id,
                socket: socket
            });

            console.log('topicos: ', topics);

            groceryLists.push({
                id: id,
                groceryList: request.groceryList,
                totalPrice: request.totalPrice
            })

            console.log('lista de compras: ', groceryLists)
            const message = groceryLists.filter(el => el.id === id);
            console.log('mensagem de retorno ', message);
            socket.send(JSON.stringify(message))

        } else {
            if (!resultTopics.includes(socket)) {
                console.log('Esta conexao ainda não está inscrita em um tópico');
                topics.push({
                    id: request.id,
                    socket: socket
                });    
                console.log('Adicionada a um tópico')
            } 

            const topicGroceryList = groceryLists.filter(list => list.id === request.id);
            resultTopics.forEach(el => el.socket.send(topicGroceryList));
            console.log('Esta conexão vai receber a seguinte lista: ', topicGroceryList);
        }

    });

    socket.on('close', () => {
        sockets = sockets.filter(s => s !== socket);
        groceryLists = groceryLists.filter(gl => gl.id !== socket.id);
    });

    socket.on('error', (error) => {
        const result = groceryLists.filter(gl => gl.id === socket.id);
        result[0].error = error;
        socket.send(result[0]);
    });
});