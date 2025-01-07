const cartAPIUrl =
  "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889";
const loaderContainer = document.querySelector(".loader-container");

let data = null;
const CART_STORAGE_KEY = "shopifyCartData";

const fetchCartData = async () => {
  try {
    loaderContainer.classList.add("loading"); 
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const storedData = localStorage.getItem(CART_STORAGE_KEY);
    if (storedData) {
      data = JSON.parse(storedData);
      
      if (!data.items || data.items.length === 0) {
        const response = await fetch(cartAPIUrl);
        data = await response.json();
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
      }
    } else {
      const response = await fetch(cartAPIUrl);
      data = await response.json();
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
    }

    renderCartItems(data.items);

    recalculateCartTotals();
  } catch (error) {
    console.error("Error fetching cart data:", error);
    alert("Something went wrong! Please try again later.");
  } finally {
    loaderContainer.classList.remove("loading"); 
  }
};

const renderCartItems = (items) => {
  const cartTableBody = document.querySelector(".cart-items tbody");

  if (!cartTableBody) {
    console.error("Cart table body not found.");
    return;
  }

  cartTableBody.innerHTML = "";

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td class="product">
                <img src="${item.image}" alt="${item.title}">
                <span>${item.title}</span>
            </td>
            <td>₹${item.presentment_price.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</td>
            <td>
                <input type="number" class="quantity" value="${
                  item.quantity
                }" min="1" data-id="${item.id}">
            </td>
            <td class="subtotal">
                ₹${(item.presentment_price * item.quantity).toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
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
    subtotalElement.textContent = `₹${subtotal.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } else {
    console.error("Subtotal element not found.");
  }

  if (totalElement) {
    totalElement.textContent = `₹${subtotal.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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
  const itemId = Number(input.dataset.id);

  if (newQuantity > 0) {
    console.log(`Updated item ${itemId} to quantity ${newQuantity}`);
  } else {
    alert("Quantity must be at least 1.");
    input.value = 1;
  }

  const row = input.closest("tr");
  const itemPrice = data.items.find(
    (item) => item.id === itemId
  ).presentment_price;
  const newSubtotal = newQuantity * itemPrice;

  const subtotalCell = row.querySelector(".subtotal");
  subtotalCell.dataset.price = newSubtotal;

  subtotalCell.innerHTML = `
        ₹${newSubtotal.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        <button class="trash" data-id="${itemId}">🗑️</button>
    `;
  attachEventListeners();
  recalculateCartTotals();

  const itemIndex = data.items.findIndex((item) => item.id === itemId);
  if (itemIndex !== -1) {
    data.items[itemIndex].quantity = newQuantity;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
  }
};

const handleRemoveItem = (event) => {
  const itemId = event.target.dataset.id;
  console.log(`Removing item ${itemId}`);

  const row = event.target.closest("tr");
  row.remove();

  data.items = data.items.filter((item) => item.id !== Number(itemId));
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));

  recalculateCartTotals();
};

const recalculateCartTotals = () => {
  const subtotals = document.querySelectorAll(".subtotal");
  let newTotal = 0;

  subtotals.forEach((subtotalElement) => {
    const subtotalText = subtotalElement.textContent
      .split("🗑️")[0]
      .replace("₹", "")
      .replace(/,/g, "")
      .trim();
    const subtotalValue = parseFloat(subtotalText);
    newTotal += subtotalValue;
  });

  updateCartTotals(newTotal);
};

fetchCartData();

document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector(".header-nav");

  hamburger.addEventListener("click", function () {
    hamburger.classList.toggle("active");
    nav.classList.toggle("active");
  });

  document.addEventListener("click", function (event) {
    if (!hamburger.contains(event.target) && !nav.contains(event.target)) {
      hamburger.classList.remove("active");
      nav.classList.remove("active");
    }
  });

  // Checkout button functionality
//   const checkoutButton = document.getElementById("checkout");
//   if (checkoutButton) {
//     checkoutButton.addEventListener("click", function () {
//       alert("Thank you for your order! Your items will be processed shortly.");
//       console.log("Checkout clicked");
//     });
//   } else {
//     console.error("Checkout button not found.");
//   }
});
