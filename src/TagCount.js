export const TagCount = (props) => {
	const className=`chip-tag${props.type}`;
	return <span className={className}>{props.value}</span>
}