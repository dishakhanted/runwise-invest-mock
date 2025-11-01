export const DisclosureFooter = () => {
  return (
    <div className="w-full py-6 px-6 mt-8">
      <button
        className="text-primary text-sm hover:underline"
        onClick={() => {
          window.location.href = "/profile#disclosure";
        }}
      >
        Disclosures
      </button>
    </div>
  );
};
