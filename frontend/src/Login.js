import React, { useState } from 'react';
import './Login.css';

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    return(
        <div className="login-container">
            <h2 className="form-title">{isLogin ? 'Login' : 'Sign Up'}</h2>
            <form className="auth-form">
                {!isLogin && (
                    <>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input type="text" id="name" className="form-control" placeholder="Enter your name"></input>
                        </div>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" className="form-control" placeholder="Enter username" />
                        </div>
                    </>
                )}
                    <div className="form-group">
                            <label htmlFor="email">Email address</label>
                            <input type="email" id="email" className="form-control" placeholder="Enter email" />
                    </div>
                    <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" className="form-control" placeholder="Enter password" />
                    </div>
                    <button type="submit" className="btn primary-btn">
                     {isLogin ? 'Login' : 'Sign Up'}
                    </button>
            </form>
            <div className="switch-form">
        <button
          className="btn link-btn"
          type="button"
          onClick={() => setIsLogin(!isLogin)}
                >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </button>
        </div>
        </div>

    );
}


export default Login;

