// Native fetch is available in recent Node versions


async function test() {
    console.log("Testing POST /api/payments/create_preference...");

    // Mock payload matching frontend structure
    const payload = [
        {
            product: {
                nombre: "1 Kilo",
                precio: 12000
            },
            gustos: [
                { nombre: "Chocolate" },
                { nombre: "Vainilla" }
            ],
            price: 12000
        }
    ];

    try {
        const response = await fetch('http://localhost:8080/api/payments/create_preference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Body:", text);
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

test();
