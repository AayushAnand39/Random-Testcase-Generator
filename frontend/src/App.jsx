import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Navbar from './components/Navbar'
import EditorComponent from './components/Editor'

function App() {
  const [count, setCount] = useState(0);
  const [generatorCode, setGeneratorCode] = useState('#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}\n');
  const [actualCode, setActualCode] = useState('#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}\n');

  return (
    <>
      <Navbar/>
      <EditorComponent
        generatorCode={generatorCode}
        setGeneratorCode={setGeneratorCode}
        actualCode={actualCode}
        setActualCode={setActualCode}
      />
    </>
  )
}

export default App
