import { useState } from 'react'
import './App.css'
import { auth } from "./config/firebase";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <section id="center">
                <div>
                    <h1>Task Manager</h1>
                    <p>Mejora tu productividad </p>
                </div>
                <button
                    type="button"
                    className="counter"
                    onClick={() => setCount((count) => count + 1)}
                >
                    Count is {count}
                </button>
            </section>

            <div className="ticks"></div>

            <section id="next-steps">

            </section>

            <div className="ticks"></div>
            <section id="spacer"></section>
        </>
    )
}

export default App
