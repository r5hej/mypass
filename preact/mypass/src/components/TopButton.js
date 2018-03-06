export default function TopButton(props) {
	return (<button class={`material-button btn ${props.align}-align material-icons`} title={props.title}
		onClick={props.click}
	        >{props.icon}</button>);
}