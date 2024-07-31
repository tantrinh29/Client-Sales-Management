import { notification } from "antd";

export default function createNotification(status, placement, title) {
  notification[status]({
    message: `Notification`,
    description: title,
    placement,
  });
}
