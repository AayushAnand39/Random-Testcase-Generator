import { useState } from "react";
import EditorComponent from "../components/Editor";

export default function LegacyPage() {

    const [generatorCode, setGeneratorCode] = useState(
`#include<bits/stdc++.h>
using namespace std;

int main(){

}`
    );

    const [actualCode, setActualCode] = useState(
`#include<bits/stdc++.h>
using namespace std;

int main(){

}`
    );

    return (
        <EditorComponent
            generatorCode={generatorCode}
            setGeneratorCode={setGeneratorCode}
            actualCode={actualCode}
            setActualCode={setActualCode}
        />
    );
}