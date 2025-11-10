import React, { useEffect, useState } from "react";

export default function TextBox({ initialText = "", onChange, placeholder = "Type or paste text here...", rows = 10, className = "" }) {
	const [text, setText] = useState(initialText);

	useEffect(() => {
		setText(initialText);
	}, [initialText]);

	const handleChange = (e) => {
		setText(e.target.value);
		if (typeof onChange === "function") onChange(e.target.value);
	};

	return (
		<div className={`text-box ${className}`}>
			<textarea
				value={text}
				onChange={handleChange}
				placeholder={placeholder}
				rows={rows}
				style={{
					width: "100%",
					minHeight: rows * 24,
					padding: "0.75rem",
					borderRadius: "8px",
					border: "1px solid #ccc",
					fontSize: "0.95rem",
					resize: "vertical",
				}}
			/>
		</div>
	);
}
