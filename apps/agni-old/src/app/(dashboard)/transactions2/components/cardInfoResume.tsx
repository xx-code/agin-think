import './cardInfoResume.css';

export default function CardInfoResume({totalSpend, totalEarning}: {totalSpend: number|undefined, totalEarning: number|undefined}) {
    let spend = '-------';
    let earning = '-------';
    let diff = '--------'

    if (totalSpend) {
        spend = totalSpend.toString()
    }

    if (totalEarning) {
        earning = totalEarning.toString()
    }

    if (totalSpend && totalEarning) {
        let calculDiff = totalEarning - totalSpend
        diff = (calculDiff).toString() 
    }

    return (
        <div className='card-info-resume'>
            <div className='card-info-resume-content'>
                <div className='card'>
                    <h3>Total depsense</h3>
                    <p className='card-spend'>{spend}</p>
                </div>
                <div className='card'>
                    <h3>Total gains</h3>
                    <p className='card-earning'>{earning}</p>
                </div>
                <div className='card'>
                    <h3>Total difference</h3>
                    <p className='card-diff'>{diff}</p>
                </div>
            </div>
        </div>
    )
}