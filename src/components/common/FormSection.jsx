export default function FormSection({ title, children }) {
  return (
    <fieldset className="border border-gray-200 rounded-xl p-6">
      <legend className="px-3 text-base font-semibold text-gray-900">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}