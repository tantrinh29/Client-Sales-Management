export default function formatDate(inputDate) {
  const date = new Date(inputDate);

  const day = date.getDate();
  const month = date.getMonth() + 1; 
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Định dạng giờ và phút để luôn có 2 chữ số
  const formattedHours = hours.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");

  const formattedDate = `${formattedHours}:${minutesStr} ${day}-${month}-${year}`;
  return formattedDate;
}