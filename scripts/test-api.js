async function test() {
    try {
        console.log("Testing intent...");
        const intentRes = await fetch("http://localhost:3000/api/intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: "plumber in lahore" })
        });
        const intentData = await intentRes.json();
        console.log("Intent output:", intentData);

        console.log("Testing discover...");
        const discoverRes = await fetch("http://localhost:3000/api/discover", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ intent: intentData })
        });
        const text = await discoverRes.text();
        console.log("Status:", discoverRes.status);
        console.log("Discover response text:", text);

    } catch (e) {
        console.error(e);
    }
}
test();
