import React, { useState } from 'react';
import './App.css';

function App() {
  const [numberOfFriends, setNumberOfFriends] = useState(1);
  const [tip, setTip] = useState(0);
  const [tax, setTax] = useState(0);
  const [orders, setOrders] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newPerson, setNewPerson] = useState(0);
  const [perPersonAmounts, setPerPersonAmounts] = useState([]); // State to store amount per friend
  const [suggestedMeal, setSuggestedMeal] = useState(''); // State to store the meal suggestion image
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages

  // Fetch a random meal suggestion image from the Foodish API using GET /api/
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

  // Calculate the evenly divided tax and tip per friend
  const calculateTaxAndTipPerFriend = () => {
    const subtotal = calculateSubtotal();
    const totalWithExtras = calculateTotalWithTipAndTax();
    const extras = totalWithExtras - subtotal; // Total tax and tip
    return extras / numberOfFriends; // Evenly divide tax and tip among friends
  };

  // Calculate amount per friend: item costs + tax/tip
  const calculateAmountPerFriend = () => {
    if (orders.length === 0) {
      setErrorMessage('Please add at least one order before calculating.');
      return;
    }
    
    setErrorMessage(''); // Clear any existing error messages
    
    const totals = Array(numberOfFriends).fill(0); // Initialize totals for each friend to 0

    // Add each friend's order cost to their total
    orders.forEach((order) => {
      const personIndex = parseInt(order.person, 10); // Get the person index
      if (!isNaN(personIndex) && personIndex < numberOfFriends && order.cost) {
        totals[personIndex] += parseFloat(order.cost); // Add order cost to the friend's total
      }
    });

    const taxAndTipPerFriend = calculateTaxAndTipPerFriend(); // Calculate tax/tip per friend

    // Add tax and tip per friend to each friend's total
    const finalTotals = totals.map((total) => total + taxAndTipPerFriend);
    setPerPersonAmounts(finalTotals); // Update state with final amounts per person
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
          min="1"
        />
      </div>

      <div>
        <h3>Subtotal: ${calculateSubtotal().toFixed(2)}</h3>
        <h3>Total with Tax and Tip: ${calculateTotalWithTipAndTax().toFixed(2)}</h3>
        <h3>Tax and Tip per Friend: ${calculateTaxAndTipPerFriend().toFixed(2)}</h3>
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
          {Array.from({ length: numberOfFriends }, (_, i) => (
            <option key={i} value={i}>
              Friend {i + 1}
            </option>
          ))}
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
              <label> Assigned to Friend: </label>
              <select
                value={order.person}
                onChange={(e) => handleOrderChange(index, 'person', e.target.value)}
              >
                {Array.from({ length: numberOfFriends }, (_, i) => (
                  <option key={i} value={i}>
                    Friend {i + 1}
                  </option>
                ))}
              </select>
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
              <h4>Friend {index + 1}</h4>
              <p>Total: ${amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {suggestedMeal && (
        <div>
          <h3>Meal Suggestion for Your Next Meal:</h3>
          <img src={suggestedMeal} alt="Suggested meal" style={{ width: '300px', height: '200px' }} />
        </div>
      )}

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}

export default App;
