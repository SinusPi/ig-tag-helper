import React from "react";

export const TagCount = React.memo(props => {
	const className=`chip-tag${props.type}`;
	return <span className={className}>{props.value}</span>
})
