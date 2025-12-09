# 🎨 Hướng dẫn Import SVG trong Vite

## ✅ Đã sửa lỗi SVG Import

### Vấn đề
```
Uncaught SyntaxError: The requested module '/src/assets/icons/app_store_badge.svg?import' 
does not provide an export named 'ReactComponent'
```

### Nguyên nhân
Vite với `vite-plugin-svgr` sử dụng cú pháp khác với Create React App để import SVG as React component.

---

## 📝 Cách Import SVG trong Vite

### 1. **Import SVG as React Component**

```typescript
// ❌ CRA (cũ) - KHÔNG hoạt động trong Vite
import { ReactComponent as Logo } from './logo.svg';

// ✅ Vite (mới) - Sử dụng ?react suffix
import Logo from './logo.svg?react';

// Sử dụng
<Logo width={100} height={100} />
```

### 2. **Import SVG as URL (string)**

```typescript
// ✅ Hoạt động giống nhau trong cả CRA và Vite
import logoUrl from './logo.svg';

// Sử dụng
<img src={logoUrl} alt="Logo" />
```

---

## 🔧 Các thay đổi đã thực hiện

### 1. **Cập nhật `vite-env.d.ts`**

Đã thêm type definitions cho SVG imports:

```typescript
// SVG imports with ?react suffix (as React component)
declare module '*.svg?react' {
  import { FunctionComponent, SVGProps } from 'react';
  const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

// Regular SVG imports (as URL string)
declare module '*.svg' {
  const content: string;
  export default content;
}
```

### 2. **Sửa file `MobileAppSection.tsx`**

```typescript
// Trước (CRA)
import { ReactComponent as AppStoreBadge } from 'assets/icons/app_store_badge.svg';
import { ReactComponent as GooglePlayBadge } from 'assets/icons/google_play_badge.svg';

// Sau (Vite)
import AppStoreBadge from 'assets/icons/app_store_badge.svg?react';
import GooglePlayBadge from 'assets/icons/google_play_badge.svg?react';
```

---

## 📚 Quy tắc Import SVG

### Khi nào dùng `?react`?

✅ **Dùng `?react`** khi:
- Muốn sử dụng SVG như một React component
- Cần thay đổi props (color, size, className, etc.)
- Cần style động hoặc animation

```typescript
import Icon from './icon.svg?react';

<Icon 
  width={24} 
  height={24} 
  fill="currentColor"
  className="my-icon"
/>
```

### Khi nào KHÔNG dùng `?react`?

✅ **Import thường** khi:
- Chỉ cần hiển thị SVG như một image
- Không cần thay đổi props
- Sử dụng trong `<img>` tag

```typescript
import iconUrl from './icon.svg';

<img src={iconUrl} alt="Icon" />
```

---

## 🎯 Ví dụ thực tế

### Component Icon với Props

```typescript
// Icon.tsx
import LogoIcon from 'assets/logo.svg?react';

export const Logo = ({ size = 24, color = 'currentColor' }) => {
  return <LogoIcon width={size} height={size} fill={color} />;
};
```

### Image với URL

```typescript
// Banner.tsx
import bannerImage from 'assets/banner.svg';

export const Banner = () => {
  return <img src={bannerImage} alt="Banner" />;
};
```

---

## 🔍 Kiểm tra các file khác

Đã kiểm tra toàn bộ codebase:
- ✅ Không còn file nào sử dụng `ReactComponent as` syntax
- ✅ Các file import SVG as URL vẫn hoạt động bình thường
- ✅ Chỉ có `MobileAppSection.tsx` cần sửa

---

## 📖 Tham khảo

- [vite-plugin-svgr Documentation](https://github.com/pd4d10/vite-plugin-svgr)
- [Vite Static Asset Handling](https://vitejs.dev/guide/assets.html)
- [SVGR Documentation](https://react-svgr.com/)

---

**Lỗi đã được sửa! Bây giờ SVG imports sẽ hoạt động tốt trong Vite! 🎉**
