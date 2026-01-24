import './Home.css';

const Home = () => {
    return (
        <div className="home">
            <div className="home-container">
                <h1 className="home-title">DevNest Job Board</h1>
                <p className="home-subtitle">
                    Намерете вашата следваща IT работа или наемете топ таланти
                </p>
                <div className="home-content">
                    {/* Content will be added later */}
                    <p>Търсете обяви, разглеждайте компании, или прочетете най-новите от блога ни.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;