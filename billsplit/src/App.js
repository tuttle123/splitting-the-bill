import React, { useState } from 'react';
import './App.css';

function App() {
  const [numberOfFriends, setNumberOfFriends] = useState(2); // Default to 2 friends
  const [tip, setTip] = useState(0);
  const [tax, setTax] = useState(0);
  const [orders, setOrders] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newPerson, setNewPerson] = useState(0); // Default to Friend 1
  const [perPersonAmounts, setPerPersonAmounts] = useState([]); // Store amount per friend
  const [suggestedMeal, setSuggestedMeal] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch a random meal suggestion image from the Foodish API
  const fetchMealSuggestion = async () => {
    try {
      const response = await fetch('https://foodish-api.com/api/');
      const data = await response.json();
      if (data && data.image) {
        setSuggestedMeal(data.image); // Set the random meal suggestion image URL
        setErrorMessage('');
      } else {
        setErrorMessage('Unable to retrieve meal suggestion.');
        setSuggestedMeal('');
      }
    } catch (error) {
      setErrorMessage('Error fetching meal suggestion');
      console.error('Error fetching meal suggestion:', error);
    }
  };

  // Add a new order with manual inputs for item, cost, and person
  const handleAddOrder = () => {
    const cost = parseFloat(newCost);
    if (newItem && !isNaN(cost) && cost > 0) {
      const newOrder = { item: newItem, cost: cost, person: newPerson };
      setOrders([...orders, newOrder]);

      setNewItem(''); // Clear input after adding
      setNewCost(''); // Clear input after adding
    } else {
      alert('Please enter a valid item name and cost.');
    }
  };

  const handleOrderChange = (index, field, value) => {
    const newOrders = [...orders];
    newOrders[index][field] = value;
    setOrders(newOrders);
  };

  const handleRemoveOrder = (index) => {
    const newOrders = orders.filter((_, i) => i !== index);
    setOrders(newOrders);
  };

  // Calculate the subtotal before tax and tip (sum of all order costs)
  const calculateSubtotal = () => {
    return orders.reduce((acc, order) => acc + parseFloat(order.cost), 0);
  };

  // Calculate the total bill including tax and tip
  const calculateTotalWithTipAndTax = () => {
    const subtotal = calculateSubtotal();
    const tipAmount = subtotal * (parseFloat(tip) / 100);
    const taxAmount = parseFloat(tax) || 0;
    return subtotal + tipAmount + taxAmount;
  };

  // Calculate the amount for Friend 2 (total bill minus Friend 1's cost, including tax and tip)
  const calculateAmountPerFriend = () => {
    if (orders.length === 0) {
      setErrorMessage('Please add at least one order before calculating.');
      return;
    }

    setErrorMessage(''); // Clear any existing error messages
    
    // Calculate the total bill with tax and tip
    const totalWithExtras = calculateTotalWithTipAndTax();

    // Initialize totals for Friend 1 and Friend 2
    const totals = [0, 0]; // totals[0] for Friend 1, totals[1] for Friend 2

    // Add the cost of orders to Friend 1's total
    orders.forEach((order) => {
      if (order.person === 0) {
        totals[0] += parseFloat(order.cost); // Add Friend 1's orders
      }
    });

    // Calculate Friend 1's share of tax and tip
    const subtotal = calculateSubtotal();
    const friend1TaxAndTip = (totals[0] / subtotal) * (totalWithExtras - subtotal);

    // Update Friend 1's total to include their share of tax and tip
    totals[0] += friend1TaxAndTip;

    // Assign the remaining amount to Friend 2
    totals[1] = totalWithExtras - totals[0]; // Friend 2 gets the remainder

    setPerPersonAmounts(totals); // Update state with final amounts per person
  };

  // Submit and show suggested meal using the random Foodish API
  const handleSubmit = async () => {
    if (orders.length > 0) {
      calculateAmountPerFriend(); // Calculate and display the total amount per friend
      await fetchMealSuggestion(); // Fetch the random meal suggestion after calculation
    } else {
      setErrorMessage('Please add at least one order before calculating.');
    }
  };

  return (
    <div className="App">
      <h1>Bill Splitter with Random Meal Suggestion</h1>

      <div>
        <label>Tip (%): </label>
        <input
          type="number"
          value={tip}
          onChange={(e) => setTip(e.target.value)}
          placeholder="Enter tip percentage"
        />
      </div>

      <div>
        <label>Tax ($): </label>
        <input
          type="number"
          value={tax}
          onChange={(e) => setTax(e.target.value)}
          placeholder="Enter tax amount"
        />
      </div>

      <div>
        <label>Number of Friends: </label>
        <input
          type="number"
          value={numberOfFriends}
          onChange={(e) => setNumberOfFriends(e.target.value)}
          min="2"
          max="2" // Limiting to 2 friends for this logic
        />
      </div>

      <div>
        <h3>Subtotal: ${calculateSubtotal().toFixed(2)}</h3>
        <h3>Total with Tax and Tip: ${calculateTotalWithTipAndTax().toFixed(2)}</h3>
      </div>

      <div>
        <h3>Add New Order</h3>
        <label>Item Name: </label>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Enter item name"
        />
        <label>Cost: $</label>
        <input
          type="number"
          value={newCost}
          onChange={(e) => setNewCost(e.target.value)}
          placeholder="Enter item cost"
        />
        <label>Assigned to Friend: </label>
        <select value={newPerson} onChange={(e) => setNewPerson(e.target.value)}>
          <option value="0">Friend 1</option>
          <option value="1">Friend 2</option>
        </select>
        <button onClick={handleAddOrder}>Add to Order</button>
      </div>

      <div>
        <h3>Orders</h3>
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div key={index}>
              <label>Item {index + 1}: {order.item} </label>
              <label> Cost: ${order.cost.toFixed(2)} </label>
              <label> Assigned to: {order.person === 0 ? 'Friend 1' : 'Friend 2'} </label>
              <button onClick={() => handleRemoveOrder(index)}>Remove</button>
            </div>
          ))
        ) : (
          <p>No orders added yet.</p>
        )}
      </div>

      <button onClick={handleSubmit}>Calculate and Suggest Next Meal</button>

      {perPersonAmounts.length > 0 && (
        <div>
          <h3>Amount Each Friend Should Pay:</h3>
          {perPersonAmounts.map((amount, index) => (
            <div key={index}>
              <h4>{`Friend ${index + 1}`}</h4>
              <p>Total: ${amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {suggestedMeal && (
        <div>
          <h3>Meal Suggestion for Your Next Meal:</h3>
          <img
            src={suggestedMeal}
            alt="Suggested meal"
            style={{ width: '300px', height: '200px' }}
            onError={(e) => {
              e.target.onerror = null; // Prevents infinite loop if error happens again
              e.target.src = 'default-image-url.jpg'; // Replace with a placeholder image if it fails to load
            }}
          />
        </div>
      )}

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}

export default App;
