"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = async (event) => {
    for (const field in event) {
        if (event.hasOwnProperty(field)) {
            console.log(`Field: ${field}`);
            console.log(`Value: ${event[field]}`);
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW1iZGEvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO0lBQzlCLEtBQUssTUFBTSxLQUFLLElBQUksS0FBSyxFQUFFO1FBQ3ZCLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUN2QztLQUNKO0FBQ0wsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0cy5oYW5kbGVyID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgZm9yIChjb25zdCBmaWVsZCBpbiBldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQuaGFzT3duUHJvcGVydHkoZmllbGQpKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYEZpZWxkOiAke2ZpZWxkfWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBWYWx1ZTogJHtldmVudFtmaWVsZF19YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7fSJdfQ==