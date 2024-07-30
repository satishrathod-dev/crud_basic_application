import { Route, Routes } from "react-router-dom";
import CustomerForm from "./components/CustomerForm/CustomerForm";
import CustomerList from "./components/CustomerListPage/CustomerList";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<CustomerList />} />
        <Route path="/add" element={<CustomerForm />} />
        <Route path="/edit/:id" element={<CustomerForm />} />
      </Routes>
    </div>
  );
}

export default App;
