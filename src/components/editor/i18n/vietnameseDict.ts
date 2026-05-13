import { en } from "@blocknote/core/locales";

/**
 * Vietnamese localization dictionary for BlockNote.
 * We start from en and override slash menu, placeholders, side menu, file panel.
 */
export const vietnameseDict = {
  ...en,
  slash_menu: {
    ...en.slash_menu,
    heading: {
      title: "Tiêu đề 1",
      subtext: "Tiêu đề cấp 1",
      aliases: ["h1", "tieude", "tieu-de"],
      group: "Tiêu đề",
    },
    heading_2: {
      title: "Tiêu đề 2",
      subtext: "Tiêu đề cấp 2",
      aliases: ["h2"],
      group: "Tiêu đề",
    },
    heading_3: {
      title: "Tiêu đề 3",
      subtext: "Tiêu đề cấp 3",
      aliases: ["h3"],
      group: "Tiêu đề",
    },
    paragraph: {
      title: "Đoạn văn",
      subtext: "Văn bản thường",
      aliases: ["p", "doanvan"],
      group: "Cơ bản",
    },
    bullet_list: {
      title: "Danh sách",
      subtext: "Danh sách có dấu",
      aliases: ["ul", "bullet", "danhsach"],
      group: "Danh sách",
    },
    numbered_list: {
      title: "Danh sách số",
      subtext: "Danh sách đánh số",
      aliases: ["ol", "so"],
      group: "Danh sách",
    },
    check_list: {
      title: "Checklist",
      subtext: "Danh sách có ô check",
      aliases: ["check", "todo"],
      group: "Danh sách",
    },
    table: {
      title: "Bảng",
      subtext: "Bảng dữ liệu",
      aliases: ["table", "bang"],
      group: "Nâng cao",
    },
    image: {
      title: "Ảnh",
      subtext: "Tải lên hoặc nhập URL",
      aliases: ["img", "anh"],
      group: "Media",
    },
    video: {
      title: "Video",
      subtext: "Video MP4 hoặc URL embed",
      aliases: ["video"],
      group: "Media",
    },
    file: {
      title: "Tệp",
      subtext: "Tải lên tệp đính kèm",
      aliases: ["file", "tep"],
      group: "Media",
    },
    quote: {
      title: "Trích dẫn",
      subtext: "Khối trích dẫn",
      aliases: ["quote", "trichdan"],
      group: "Khối",
    },
    divider: {
      title: "Phân cách",
      subtext: "Đường kẻ ngang",
      aliases: ["hr", "divider", "phancach"],
      group: "Khối",
    },
    code_block: {
      title: "Khối mã",
      subtext: "Đoạn mã có syntax highlight",
      aliases: ["code", "ma"],
      group: "Khối",
    },
  },
  placeholders: {
    ...en.placeholders,
    default: "Gõ '/' để chọn loại nội dung...",
    emptyDocument: "Bắt đầu viết...",
    heading: "Tiêu đề",
    bulletListItem: "Danh sách",
    numberedListItem: "Danh sách",
  },
  side_menu: {
    add_block_label: "Thêm khối",
    drag_handle_label: "Kéo để di chuyển",
  },
} as typeof en;
