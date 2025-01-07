// Fetch and dynamically display cart data from the API
const cartAPIUrl = "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889";
const loaderContainer = document.querySelector('.loader-container');

const fetchCartData = async () => {
    try {
        loaderContainer.classList.add('loading');
        const response = await fetch(cartAPIUrl);
        const data = await response.json();
        renderCartItems(data.items);
        updateCartTotals(data.original_total_price);
    } catch (error) {
        console.error("Error fetching cart data:", error);
        alert("Something went wrong! Please try again later.");
    } finally {
        loaderContainer.classList.remove('loading');
    }
};


const renderCartItems = (items) => {
    const cartTableBody = document.querySelector(".cart-items tbody");

    if (!cartTableBody) {
        console.error("Cart table body not found.");
        return; // Exit early if the element doesn't exist
    }

    cartTableBody.innerHTML = ""; // Clear previous items

    items.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="product">
                <img src="${item.image}" alt="${item.title}">
                <span>${item.title}</span>
            </td>
            <td>₹${(item.price / 100).toFixed(2)}</td>
            <td>
                <input type="number" class="quantity" value="${item.quantity}" min="1" data-id="${item.id}">
            </td>
            <td class="subtotal">
                ₹${(item.price * item.quantity / 100).toFixed(2)}
                <button class="trash" data-id="${item.id}">🗑️</button>
            </td>
        `;
        cartTableBody.appendChild(row);
    });

    attachEventListeners();
};


const updateCartTotals = (subtotal) => {
    const subtotalElement = document.querySelector("#subtotal");
    const totalElement = document.querySelector("#total");

    if (subtotalElement) {
        subtotalElement.textContent = `₹${(subtotal / 100).toFixed(2)}`; 
    } else {
        console.error("Subtotal element not found.");
    }

    if (totalElement) {
        totalElement.textContent = `₹${(subtotal / 100).toFixed(2)}`; 
    } else {
        console.error("Total element not found.");
    }
};



const attachEventListeners = () => {
    const quantityInputs = document.querySelectorAll(".quantity");
    const removeButtons = document.querySelectorAll(".trash");

    quantityInputs.forEach((input) => {
        input.addEventListener("change", handleQuantityChange);
    });

    removeButtons.forEach((button) => {
        button.addEventListener("click", handleRemoveItem);
    });
};


const handleQuantityChange = (event) => {
    const input = event.target;
    const newQuantity = parseInt(input.value);
    const itemId = input.dataset.id;

    if (newQuantity > 0) {
        console.log(`Updated item ${itemId} to quantity ${newQuantity}`);
    } else {
        alert("Quantity must be at least 1.");
        input.value = 1;
    }

    // Update subtotal for the individual item
    const row = input.closest("tr");
    const itemPrice = parseFloat(row.querySelector("td:nth-child(2)").textContent.replace("₹", ""));
    const newSubtotal = newQuantity * itemPrice;

    const subtotalCell = row.querySelector(".subtotal");
    // Preserve the trash icon when updating subtotal
    subtotalCell.innerHTML = `
        ₹${newSubtotal.toFixed(2)}
        <span class="trash" data-id="${itemId}">🗑️</span>
    `;
    attachEventListeners();
    recalculateCartTotals();
};

const handleRemoveItem = (event) => {
    const itemId = event.target.dataset.id;
    console.log(`Removing item ${itemId}`);

    // Remove the item from the DOM
    const row = event.target.closest("tr");
    row.remove();

    recalculateCartTotals();
};

const recalculateCartTotals = () => {
    const subtotals = document.querySelectorAll(".subtotal");
    let newTotal = 0;

    subtotals.forEach((subtotalElement) => {
        // Extract only the price part before the trash icon
        const subtotalText = subtotalElement.textContent.split('🗑️')[0].replace('₹', '').trim();
        const subtotalValue = parseFloat(subtotalText) * 100; // Convert rupees to paise
        newTotal += subtotalValue;
    });

    updateCartTotals(newTotal);
};


// Initialize cart page
fetchCartData();
