function Card(props){
    return<div style={{
        height:"200px",
        width:"350px",
        marginTop:"60px",
        border:"1.5px solid rgb(0, 0, 0)",
        padding:"10px",
        
        
        marginLeft: props.marginLeft,
        marginRight: props.marginRight,
        borderRadius:"20px",
        background:"rgb(239, 250, 217)",
        boxShadow:"5px 5px 5px #9c9c9c"
    
    }}>
        <h6 style={{margin:"0",fontFamily: "Comic Sans MS, cursive, sans-serif",color:"#168ef7"}}>{props.heading}</h6>
        <p style={{fontSize:"20px"}}>{props.text}</p>
    </div>
}

export default Card;