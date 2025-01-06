// Fetch and dynamically display cart data from the API
const cartAPIUrl = "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889";

const fetchCartData = async () => {
    try {
        const response = await fetch(cartAPIUrl);
        const data = await response.json();
        renderCartItems(data.items);
        updateCartTotals(data.original_total_price);
    } catch (error) {
        console.error("Error fetching cart data:", error);
    }
};

const renderCartItems = (items) => {
    const cartTableBody = document.querySelector(".cart-items tbody");
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
                <span class="trash" data-id="${item.id}">🗑️</span>
            </td>
        `;
        cartTableBody.appendChild(row);
    });

    attachEventListeners();
};

const updateCartTotals = (subtotal) => {
    // Update total amount in cart (assuming original total price in paise)
    document.querySelector(".totals .subtotal span").textContent = `₹${(subtotal / 100).toFixed(2)}`;
    document.querySelector(".totals .total span").textContent = `₹${(subtotal / 100).toFixed(2)}`; // Assuming no additional fees
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
        input.value = 1; // Reset to minimum value
    }

    // Update subtotal for the individual item
    const row = input.closest("tr");
    const itemPrice = parseFloat(row.querySelector("td:nth-child(2)").textContent.replace("₹", ""));
    const newSubtotal = newQuantity * itemPrice;

    // Update subtotal in the row
    row.querySelector(".subtotal").innerHTML = `
        ₹${newSubtotal.toFixed(2)}
        <span class="trash" data-id="${itemId}">🗑️</span>
    `;

    attachEventListeners(); // Reattach listeners for the new trash icon
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
        const subtotalText = subtotalElement.textContent.replace("₹", "").trim();
        newTotal += parseFloat(subtotalText);
    });

    updateCartTotals(newTotal * 100); // Convert to paise for consistency
};

// Initialize cart page
fetchCartData();
