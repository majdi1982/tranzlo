const { Client, Databases } = require("node-appwrite");

const client = new Client()
    .setEndpoint("https://appwrite.tranzlo.net/v1")
    .setProject("6a156f9000335c99e9be")
    .setKey("standard_17383c66fe7564fe45a118d89c5bc194c8bfbb05c50dde040e1e9373419e59bf107290a09f561c74f80fecd3302f665617d7cefb7aed89687d938a63592dd898484fe95a2d6480d3b78709a475be7e8ef24d31f9b39eb6680f010e4d7e4e899fde86d67e14088383a703e7eb0811177235db722a3e6077bba8ad2363089922cf");

const databases = new Databases(client);

databases.listCollections("tranzlo_main")
    .then(res => {
        console.log(res.collections.map(c => c.$id));
    })
    .catch(err => {
        console.error("Error:", err.message);
    });
