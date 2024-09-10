import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { fetchInitialData } from "@/components/board/InitialData";
import { createClient } from "@/utils/client";

interface Item {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  itemId: string[];
}

interface Data {
  columns: { [key: string]: Column };
  items: { [key: string]: Item };
  columnOrder: string[];
}

const Board: React.FC = () => {
  const [data, setData] = useState<Data | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const initialData = await fetchInitialData();
        if (initialData && initialData.columns && initialData.items && initialData.columnOrder) {
          setData(initialData);
        } else {
          console.error("Geçersiz veri yapısı:", initialData);
        }
      } catch (error) {
        console.error("Veri alınırken hata oluştu:", error);
      }
    };

    fetchData();
  }, []);

  const updateDatabase = async (updatedColumns: { [key: string]: Column }) => {
    try {
      for (const columnId in updatedColumns) {
        const column = updatedColumns[columnId];
        const { error: columnError } = await supabase
          .from("column")
          .update({ itemId: column.itemId.join(",") })
          .eq("id", column.id);

        if (columnError) throw columnError;
      }

      console.log("Veritabanı başarıyla güncellendi.");
    } catch (error) {
      console.error("Veritabanı güncellenirken hata oluştu:", error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!data) return;

    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId !== destination.droppableId) {
      const start = data.columns[source.droppableId];
      const finish = data.columns[destination.droppableId];
      const startItemId = Array.from(start.itemId);
      const finishItemId = Array.from(finish.itemId);

      const [movedItemId] = startItemId.splice(source.index, 1);
      finishItemId.splice(destination.index, 0, movedItemId);

      const updatedColumns = {
        ...data.columns,
        [source.droppableId]: { ...start, itemId: startItemId },
        [destination.droppableId]: { ...finish, itemId: finishItemId },
      };

      setData({ ...data, columns: updatedColumns });

      await updateDatabase(updatedColumns);
    } else {
      const column = data.columns[source.droppableId];
      const updatedItemIds = Array.from(column.itemId);
      const [movedItemId] = updatedItemIds.splice(source.index, 1);
      updatedItemIds.splice(destination.index, 0, movedItemId);

      const updatedColumns = {
        ...data.columns,
        [column.id]: { ...column, itemId: updatedItemIds },
      };

      setData({ ...data, columns: updatedColumns });

      await updateDatabase(updatedColumns);
    }
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board-container grid grid-cols-3 gap-4">
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          const items = column?.itemId?.map((itemIds: any) => data.items[itemIds]).filter(Boolean);
          console.log(items);

          let color;
          if (column.title === "To Do") {
            color = "text-red-500";
          } else if (column.title === "In Progress") {
            color = "text-yellow-500";
          } else {
            color = "text-green-500";
          }

          return (
            <Droppable key={column.id} droppableId={column.id} direction="vertical">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="column p-4 rounded-lg">
                  <div className="column-header">
                    <h3 className={`${color} font-bold mb-2`}>{column.title}</h3>
                  </div>
                  <div className="column-content space-y-2">
                    {items?.length === 0 && <div className="text-gray-500">No items</div>}

                    {items?.map((item: Item, index: number) => (
                      <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="item bg-white p-2 shadow rounded">
                            {item.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <div className="flex items-center justify-center hover:bg-gray-200 mt-4 h-[2rem] hover:cursor-pointer group rounded-lg">+</div>
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default Board;
