import React from "react"

const Header = ({title}) => {
    return (
        <header className="headerDiv">
            {/* тут еще должен быть фигня которая скрывает и открывает менюшку */}
            <img className="headerImg" src={null} alt="none" />
            <h1 className="headerTitle">{title}</h1>
        </header>
    )
}

export default Header