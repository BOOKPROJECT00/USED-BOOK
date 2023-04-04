import type CommonBook from "./CommonBook";

interface UsedBook extends CommonBook {
  product_id: string;
  book_id: string;
  seller_user_id: number;
  seller_user_nickname: string;
  total_status: "U" | "M" | "L";
  taer_status: "U" | "M" | "L";
  pollution_status: "U" | "M" | "L";
  doodle_status: "U" | "M" | "L";
  price: number;
  location: string;
  coordination: string;
  sold_out: 0 | 1;
  is_online: 0 | 1;
  description: string;
  image_url_1: string;
  created_at: string;
}
export default UsedBook;
