import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { IGridProps, BasicDataGrid } from "./BasicGrid";
import * as React from "react";
import { webLightTheme } from "@fluentui/react-components";

export class BasicGridForCanvas implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private theComponent: ComponentFramework.ReactControl<IInputs, IOutputs>;
    private notifyOutputChanged: () => void;
    private context: ComponentFramework.Context<IInputs>;
    private theme: any;
    private selectedItem: string;

    constructor() { }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this.context = context;
        if(context.fluentDesignLanguage) { this.theme = context.fluentDesignLanguage!.tokenTheme; }

        const props: IGridProps = {
            theme: this.theme ? this.theme : webLightTheme,
            selectionMode: context.parameters.selectionMode?.raw === "2" ? "multiselect" : context.parameters.selectionMode?.raw === "1" ? "single" : undefined,
            dataset: this.context.parameters.dataset,
            navigate: this.navigate.bind(this),
            setSelected: this.setSelected.bind(this),
        };
        return React.createElement(
            BasicDataGrid, props
        );
    }

    public navigate(options: ComponentFramework.NavigationApi.EntityFormOptions) {
        this.context.navigation.openForm(options);
    }

    public setSelected = (ids: string[]): void => {
        this.context.parameters.dataset.setSelectedRecordIds(ids);
        if(ids.length > 0)
            this.selectedItem = ids[0];
        else
            this.selectedItem = "";
        this.notifyOutputChanged();
    };

    public getOutputs(): IOutputs {
        return { selectedItem: this.selectedItem };
    }

    public destroy(): void {
    }
}
