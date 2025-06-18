import logo from '../assets/logo.svg'
import white from '../assets/logo-white.svg'
interface AppLogoProps {
    isWhite?: boolean
}
const AppLogo = ({isWhite}:AppLogoProps) =>{

    return isWhite  ?<img className=" w-[120px]" src={white.src} /> : <img className=" w-[120px]" src={logo.src} />
}

export default AppLogo