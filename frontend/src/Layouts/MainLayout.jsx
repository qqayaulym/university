import React, { useState } from "react"
import NavBar from "../components/NavBar"

const MainLayout = ({children}) => {
    return (
        <div className="mainLayout">
            <NavBar />
            <div className="mainContent">{children}</div>
        </div>
    )
}

export default MainLayout