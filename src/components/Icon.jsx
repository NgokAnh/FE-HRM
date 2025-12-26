export default function Icon({ name, filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${
        filled ? "fill" : ""
      }`}
    >
      {name}
    </span>
  );
}