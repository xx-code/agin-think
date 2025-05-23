'use client'

import TextInput from "@/app/components/textInput";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './index.css'
import { useReducer, useState } from "react";
import Button from "@/app/components/button";
import { isEmpty } from "@/_utils/isEmpty";
import { api, CallApiError } from "@/lib/api-clients";
import { SaveGoal } from "@/models/save-goal";

type ItemInput = {
    id: string
    index: number
    titleItem: string
    linkItem: string
    htmlTargetItem: string
    priceItem: number
}

type SaveGoalInput = {
    title: string
    description: string 
    target: number
    titleItem: string
    htmlTargetItem: string
    priceItem: number
    linkItem: string
    items: ItemInput[] 
    showAddNewItem: boolean
}

type SaveGoalInputError = {
    title: string
    description: string 
    target: string
}

const initSaveGoalInput: SaveGoalInput = {
    titleItem: "",
    htmlTargetItem: "",
    priceItem: 0,
    title: '',
    description: '',
    linkItem: '',
    target: 0,
    showAddNewItem: false,
    items: []
}

const initSaveGoalInputError: SaveGoalInputError = {
    title: '',
    description: '',
    target: ''
}

function createSaveGoalInputInitial(saveGoal: SaveGoal|undefined): SaveGoalInput {
    if (saveGoal) {
        return {
            title: saveGoal.name,
            description: saveGoal.description,
            items: saveGoal.items.map((item, index) => ({id: item.itemId, titleItem: item.title, linkItem: item.url, index: index, htmlTargetItem: "", priceItem: 0})),
            target: saveGoal.target,
            showAddNewItem: false,
            titleItem: "",
            linkItem: "",
            htmlTargetItem: "",
            priceItem: 0
        }
    }

    return initSaveGoalInput
}


const verifyInput = (input: SaveGoalInput): {isOk: boolean, errors: SaveGoalInputError} => {
    let isOk = true 
    let errors: SaveGoalInputError = initSaveGoalInputError

    if(isEmpty(input.title)) {
        isOk = false
        errors.title = "Vous devez ajouter un titre"
    } 

    if (input.target <= 0) {
        isOk = false
        errors.target = "Le prix doit etre superieur a 0"
    }

    return {
        isOk,
        errors
    }
} 

type ActionInput = {
    type: string
    field: string
    value: any
    valueItem: ItemInput|null
}

function reducer(state: SaveGoalInput, action: ActionInput) {
    if (action.type === 'update_field') {
        return {
            ...state,
            [action.field]: action.value
        }
    }

    if (action.type === 'add_item') {
        let items = Object.assign([], state.items)
        items.push(action.valueItem!)
        let estimation = items.reduce((acc:any, curr:any) => acc + curr.priceItem, 0)
        return {
            ...state,
            titleItem: "",
            htmlTargetItem: "",
            target: estimation,
            linkItem: "",
            priceItem: 0,
            showAddNewItem: false,
            items: items
        }
}

    if (action.type === 'remove_item') {
        let items = Object.assign([], state.items)
        let indexTag = state.items.findIndex(item => item.index === action.value)
        
        if (indexTag !== -1) {
            items.splice(indexTag, 1)
            let estimation = items.reduce((acc:any, curr:any) => acc + curr.priceItem, 0)
            return {
                ...state,
                target: estimation,
                items: items
            }
        }
    }

    if (action.type === 'show_add_new_item') {
        return {
            ...state,
            showAddNewItem: true
        }
    }

    if (action.type === 'hide_add_new_item') {
        return {
            ...state,
            showAddNewItem: false
        }
    }
        

    return state
}

type Props = {
    saveGoal: SaveGoal|undefined
    onSubmit: () => void
}

export default function SaveGoalForm({ saveGoal, onSubmit }: Props) {
    const [inputSaveGoal, dispatch] = useReducer(reducer, saveGoal, createSaveGoalInputInitial);
    const [errorInputSaveGoal, setErrorInputSaveGoal] = useState<SaveGoalInputError>(initSaveGoalInputError);

    function handleInputSaveGoal(event: any) {
        dispatch({
            type: 'update_field', 
            field: event.target.name, 
            value: event.target.value,
            valueItem: null
        })
    }

    function addItemSaveGoal() {
        if (isEmpty(inputSaveGoal.titleItem)) {
            alert("Vous devez ajouter un titre")
            return 
        }
        dispatch({
            type: "add_item",
            field: "",
            value: "",
            valueItem: {
                id: "",
                index: inputSaveGoal.items.length,
                titleItem: inputSaveGoal.titleItem,
                htmlTargetItem: inputSaveGoal.htmlTargetItem,
                priceItem: Number(inputSaveGoal.priceItem),
                linkItem: inputSaveGoal.linkItem
            }
        })
    }

    async function save() {
        try {
            const {isOk, errors} = verifyInput(inputSaveGoal)
            setErrorInputSaveGoal(errors)
            if (isOk) {
                await api.post(`/save-goals`, inputSaveGoal)
                onSubmit()
            }
        } catch(error: any) {
            let resError: CallApiError = error
            alert(resError.message) 
        }
    }

    async function update() {
        try {
            const {isOk, errors} = verifyInput(inputSaveGoal)
            setErrorInputSaveGoal(errors)
            if (isOk) {
                await api.put(`/save-goals/${saveGoal!.saveGoalId}`, inputSaveGoal)
                onSubmit()
            }
        } catch(error: any) {
            let resError: CallApiError = error
            alert(resError.message) 
        }
    }
    
    return (
        <div className="transaction-content">
            <div className='modal-body'>
                <div>
                    <TextInput 
                        type={'text'} 
                        title={'Titre'} 
                        value={inputSaveGoal.title} 
                        name={'title'} 
                        onChange={handleInputSaveGoal} 
                        error={errorInputSaveGoal.title} 
                    />
                    <TextInput 
                        type={'text'} 
                        title={'Description'} 
                        value={inputSaveGoal.description} 
                        name={'description'} 
                        onChange={handleInputSaveGoal} 
                        error={errorInputSaveGoal.description} 
                    />
                    <TextInput 
                        type={'number'} 
                        title={'Target'} 
                        value={inputSaveGoal.target} 
                        name={'target'} 
                        onChange={handleInputSaveGoal}  
                        error={errorInputSaveGoal.target}  
                />
                </div>
                <div className="btn-add-content">
                    {
                        !inputSaveGoal.showAddNewItem ?
                            <Button title={"Add Item"} backgroundColor={""} colorText={"#6755D7"} onClick={() => dispatch({type: 'show_add_new_item', field: '', value: '', valueItem: null})} />
                        :
                            <Button title={"Hide"} backgroundColor={""} colorText={"#6755D7"} onClick={() => dispatch({type: 'hide_add_new_item', field: '', value: '', valueItem: null})} />
                    }
                </div>
                {
                    inputSaveGoal.showAddNewItem ?
                        <div>
                            <TextInput type={"text"} title={"Titre"} value={inputSaveGoal.titleItem} name={"titleItem"} onChange={handleInputSaveGoal} error={""} />
                            <TextInput type={"text"} title={"Lien"} value={inputSaveGoal.linkItem} name={"linkItem"} onChange={handleInputSaveGoal} error={""} />
                            <TextInput type={"number"} title={"Prix"} value={inputSaveGoal.priceItem} name={"priceItem"} onChange={handleInputSaveGoal} error={""} />
                            <TextInput type={"text"} title={"HTML price"} value={inputSaveGoal.htmlTargetItem} name={"htmlTargetItem"} onChange={handleInputSaveGoal} error={""} /> 
                            <div>
                                <Button title="Add" backgroundColor="#6755D7" colorText="white" onClick={addItemSaveGoal} />
                            </div>                  
                        </div>
                    :
                        <></>
                }
                
                <div>
                    <ul>
                        {
                            // Refactor to sub content
                            inputSaveGoal.items.map((item, index) => (
                                <li key={index}>
                                    <span onClick={() => dispatch({field: "", type: "remove_item", value: item.index, valueItem: null})}>x</span>
                                    <div style={{width: "100%", flexDirection: "row-reverse"}}>
                                        <FontAwesomeIcon className='icon' icon={["fas", "globe"]} />
                                        <FontAwesomeIcon className='icon' icon={["fas", "code"]} />
                                    </div>
                                    {
                                        !isEmpty(item.linkItem) ?
                                            <a href={item.linkItem}  target="_blank">- {item.titleItem} | {item.priceItem}</a>
                                        :
                                            <p>- {item.titleItem} | {item.priceItem}</p>
                                    }
                                </li>
                            ))
                        }
                    </ul>
                </div>
                <div className='flex justify-around'>
                    <Button title={'Annuler'} backgroundColor={'#1E3050'} colorText={'white'} onClick={onSubmit} />
                    <Button title={ saveGoal !== undefined ? 'Modifier' : 'Ajouter'} backgroundColor={'#6755D7'} colorText={'white'} onClick={saveGoal !== undefined ? update : save} />
                </div>
            </div>
        </div>
    )
}