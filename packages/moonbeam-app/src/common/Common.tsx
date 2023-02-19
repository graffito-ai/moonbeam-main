import {Image} from "react-native"

// Duty options to be exported for SignUp component dropdown
export const dutyDropdownItems = [
    {
        label: 'Duty Status',
        value: 'Duty Status',
        disabled: true
    },
    {
        label: 'Veteran',
        value: 'Veteran',
        icon: () => <Image source={require('../../assets/three-star.png')}/>,
        parent: 'Duty Status'
    },
    {
        label: 'National Guard',
        value: 'National Guard',
        icon: () => <Image source={require('../../assets/shield.png')}/>,
        parent: 'Duty Status'
    },
    {
        label: 'Reserves',
        value: 'Reserves',
        icon: () => <Image source={require('../../assets/lifebuoy.png')}/>,
        parent: 'Duty Status'
    },
    {
        label: 'Active Duty',
        value: 'Active Duty',
        icon: () => <Image source={require('../../assets/bell.png')}/>,
        parent: 'Duty Status'
    },
]
