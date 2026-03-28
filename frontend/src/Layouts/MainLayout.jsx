import React, { useState } from "react"
import NavBar from "../components/NavBar"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { Outlet } from "react-router-dom"
import "../styles/footerHeader.css"

const MainLayout = ({children}) => {
    return (
        <div className="mainLayout">
            <Header />
            <NavBar />
            <div className="mainContent">
                <Outlet />
            </div>
            <Footer />
        </div>
    )
}

export default MainLayout