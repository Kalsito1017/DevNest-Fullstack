import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-copyright">
                    &copy; {currentYear} DevNest. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;