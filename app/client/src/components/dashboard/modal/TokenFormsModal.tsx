import Input from "../../commons/Input";

type TokenFormsModalProps = {
    tokenName: string
}

const TokenFormsModal = ({tokenName}: TokenFormsModalProps) => {
    return (
        <div className='py-5 px-6 space-y-6 border-white/60 border rounded-2xl'>
            <div className='space-y-4'>
                <Input label='Send Adress' placeholder='Send to address' inputId='address' inputStyle='modal'/>

                <Input type='number' placeholder='Amount' label='Amount' inputId='amount' inputStyle='modal'/>
            </div>

            <div className='space-y-1.5'>
                <div className='flex justify-between'>
                    <label className='font-Inter font-light text-xs'>Limit</label>
                    <span className='font-Inter font-light text-xs'>0.02 {tokenName} - 23 {tokenName}</span>
                </div>
                <div className='flex justify-between'>
                    <label className='font-Inter font-light text-xs mr-auto'>Fee</label>
                    <span className='font-Inter font-light text-xs'>0.02 {tokenName}</span>
                </div>
                <div className='flex justify-between'>
                    <label className='font-Inter font-light text-xs mr-auto'>Available</label>
                    <span className='font-Inter font-light text-xs'>1 {tokenName}</span>
                </div>
            </div>
        </div>
    )
}

export default TokenFormsModal;