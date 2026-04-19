import '../styles/row.css';

function Row() {
  return (
    <div className="row">
      <h2>Popular Shows</h2>
      <div className="row__items">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="row__item">Item {item}</div>
        ))}
      </div>
    </div>
  );
}

export default Row;
