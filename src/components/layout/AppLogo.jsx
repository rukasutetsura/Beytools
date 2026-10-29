export default function AppLogo({ className = 'w-9 h-9' }) {
  return (
    <img
      src="https://media.base44.com/images/public/6a2423b157a075f2d198b2f5/39806b1cf_image.png"
      alt="BeyTools"
      className={`${className} rounded-lg object-cover shrink-0`}
    />
  );
}