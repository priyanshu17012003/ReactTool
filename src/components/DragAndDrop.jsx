import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apikey = import.meta.env.VITE_API_BASE_URL;

const DragAndDropNavbar = () => {
  const [navComponents, setNavComponents] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [selectedComponent, setSelectedComponent] = useState(null);

  const addComponent = (type) => {
    const newComponent = {
      id: Date.now(),
      type,
      x: 10,
      y: 50,
      width: 300,
      height: type === "navbar" ? 70 : 20,
      content:
        type === "navbar" ? (
          "Navbar Box (Drag & Add Items Here)"
        ) : type === "signin" ? (
          "Sign In"
        ) : type === "logout" ? (
          "Log Out"
        ) : type === "menu" ? (
          <ul style={{ margin: 0, padding: 0, listStyleType: "none" }}>
            <li>Menu 1</li>
            <li>Menu 2</li>
            <li>Menu 3</li>
          </ul>
        ) : type === "search" ? (
          <input
            type="text"
            placeholder="Search..."
            style={{ width: "100%" }}
          />
        ) : (
          "Component"
        ),
      backgroundColor: type === "navbar" ? "#eadcf5" : "#2196F3",
      isCustom: type === "menu" || type === "search",
    };
    setNavComponents([...navComponents, newComponent]);
  };

  const handleDragStop = (e, direction, id) => {
    setNavComponents((prev) =>
      prev.map((comp) =>
        comp.id === id ? { ...comp, x: direction.x, y: direction.y } : comp
      )
    );
  };

  const handleResizeStop = (e, direction, ref, delta, position, id) => {
    setNavComponents((prev) =>
      prev.map((comp) =>
        comp.id === id
          ? {
              ...comp,
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
              x: position.x,
              y: position.y,
            }
          : comp
      )
    );
  };

  const handleColorChange = (color) => {
    setNavComponents((prev) =>
      prev.map((comp) =>
        comp.id === selectedComponent.id
          ? { ...comp, backgroundColor: color }
          : comp
      )
    );
  };

  const handleDelete=(id)=>{
    setNavComponents(
      (prev)=>(
        prev.filter((comp)=>comp.id!==id)
      )
    )

    setSelectedComponent(null);
  }

  const handleClear=()=>{
    setNavComponents([]);
    setSelectedComponent(null);
  }

  const generateReactCode = async () => {
    const layoutDetails = navComponents
      .map((comp) => {
        const content = comp.isCustom
          ? `Custom Component (${comp.type})`
          : comp.content;
        return `
      Component: ${content}
      - Position: (${comp.x}rem, ${comp.y}rem)
      - Width: ${comp.width}rem
      - Height: ${comp.height}rem
      - Background Color: ${comp.backgroundColor}
    `;
      })
      .join("\n");

    const prompt = `
      Generate a React.js functional component named Navbar with the following specifications:
      ${layoutDetails}

      -Apply Tailwind CSS classes to style each component.
      -Use className attributes instead of inline styles for all components.
      -Ensure components maintain their exact size, position, and color using Tailwind utilities.
      -Wrap all components in a parent <div> with a flex container for layout.
      -Return the code in JSX format without comments or explanations.
    `;

    try {
      const genAI = new GoogleGenerativeAI(apikey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt);

      const generatedCode = result.response.text();
      setGeneratedCode(generatedCode);
      console.log("Generated React.js Code:", generatedCode);
    } catch (error) {
      console.error("Error generating code using Gemini API:", error);
      setGeneratedCode("Failed to generate code. Please try again.");
    }
  };

  return (
    <>
    
    <div className="flex">

      <div className="w-1/5 bg-gray-100 p-5">
        <h1 className="font-bold text-xl mb-4">Navbar</h1>
        <h3 className="font-bold mb-4">✨ Components</h3>
        <ul>
        <li
          className="w-full text-black text-sm  p-2 rounded mb-1 mr-2 hover:bg-slate-400 hover:text-white hover:transition-all"
          onClick={() => addComponent("navbar")}
        >
          Navbar Box
        </li>
        <li
          className="w-full text-black text-sm  p-2 rounded mb-1 mr-2 hover:bg-slate-400 hover:text-white  hover:transition-all "
          onClick={() => addComponent("signin")}
        >
          Sign In
        </li>
        <li
          className="w-full text-black text-sm  p-2 rounded mb-1 mr-2 hover:bg-slate-400 hover:text-white  hover:transition-all"
          onClick={() => addComponent("logout")}
        >
          Log Out
        </li>
        <li
          className="w-full text-black text-sm  p-2 rounded mb-1 mr-2 hover:bg-slate-400 hover:text-white  hover:transition-all"
          onClick={() => addComponent("menu")}
        >
          Menu List
        </li>
        <li
          className="w-full text-black text-sm  p-2 rounded mb-1 mr-2 hover:bg-slate-400 hover:text-white  hover:transition-all"
          onClick={() => addComponent("search")}
        >
          Search Bar
        </li>
        </ul>
        <button
          className="w-full bg-green-400 text-white p-2 rounded mt-12"
          onClick={generateReactCode}
        >
          Generate React Code
        </button>

        {
          navComponents.length>0 ? <button className="w-full bg-red-500 text-white p-2 rounded mt-4" onClick={handleClear}>Clear</button>:null
        }

      </div>

      {/* Main Drag-and-Drop Area */}
      <div className="flex-1 bg-[#FBFBFB] relative h-screen">
        {navComponents.map((comp) => (
          <Rnd
            key={comp.id}
            style={{
              backgroundColor: comp.backgroundColor,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px solid grey",
              padding: "2rem",
              fontSize: comp.type === "navbar" ? "0.8rem" : "12px",
              textAlign: "center",
            }}
            position={{ x: comp.x, y: comp.y }}
            size={{ width: comp.width, height: comp.height }}
            onDragStop={(e, direction) => handleDragStop(e, direction, comp.id)}
            onResizeStop={(e, direction, ref, delta, position) =>
              handleResizeStop(e, direction, ref, delta, position, comp.id)
            }
            onClick={() => setSelectedComponent(comp)}
          >
            {typeof comp.content === "string" ? (
              <div>{comp.content}</div>
            ) : (
              comp.content
            )}
          </Rnd>
        ))}
      </div>

      {/* Customization Panel */}
      <div className="w-1/4 bg-gray-100 p-4">
        <h3 className="font-bold text-lg mb-4">Customize Component</h3>
        {selectedComponent ? (
          <div>
            <p>Selected: {selectedComponent.type}</p>
            <label className="block mt-4">
              Background Color:
              <input
                type="color"
                className="w-full mt-2"
                value={selectedComponent.backgroundColor}
                onChange={(e) => handleColorChange(e.target.value)}
              />
            </label>

            <button
              className="bg-red-500 text-white p-2 rounded mt-4"
              onClick={() => handleDelete(selectedComponent.id)}
            >
              Delete
            </button>
          </div>
        ) : (
          <p>Select a component to customize.</p>
        )}
        <h3 className="font-bold text-lg mt-6">Generated Code</h3>
        <pre className="bg-gray-900 text-white p-4 rounded overflow-auto">
          {generatedCode || "Generated code will appear here..."}
        </pre>
      </div>
    </div>
    </>
  );
};

export default DragAndDropNavbar;
